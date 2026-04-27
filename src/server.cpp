#include <algorithm>
#include <cctype>
#include <ctime>
#include <fstream>
#include <iostream>
#include <iterator>
#include <sstream>
#include <string>
#include <vector>

#define WIN32_LEAN_AND_MEAN
#include <winsock2.h>
#include <ws2tcpip.h>

namespace {

const int kPreferredPort = 8081;
const int kMaxRequestSize = 64 * 1024;
const char* kWebRoot = "web/";
const char* kCountFile = "web/count.txt";

struct HttpRequest {
    std::string method;
    std::string target;
    std::string version;
};

struct HttpResponse {
    int statusCode;
    std::string reason;
    std::string contentType;
    std::string body;
    bool headOnly;
    std::vector<std::string> extraHeaders;
};

long long visitorCount = 0;

bool saveVisitorCount() {
    std::ofstream output(kCountFile, std::ios::trunc);
    if (!output) {
        std::cerr << "Failed to write " << kCountFile << std::endl;
        return false;
    }

    output << visitorCount << '\n';
    return true;
}

void loadVisitorCount() {
    std::ifstream input(kCountFile);
    long long storedCount = 0;

    if (input >> storedCount && storedCount >= 0) {
        visitorCount = storedCount;
        return;
    }

    visitorCount = 0;
    saveVisitorCount();
}

std::string loadFile(const std::string& path) {
    std::ifstream input(path.c_str(), std::ios::binary);
    if (!input) {
        return "";
    }

    return std::string(std::istreambuf_iterator<char>(input), std::istreambuf_iterator<char>());
}

bool writePortFile(int port) {
    std::ofstream output("server_port.txt", std::ios::trunc);
    if (!output) {
        return false;
    }
    output << port;
    return true;
}

std::string trim(const std::string& value) {
    std::size_t begin = 0;
    std::size_t end = value.size();

    while (begin < end && std::isspace(static_cast<unsigned char>(value[begin])) != 0) {
        ++begin;
    }
    while (end > begin && std::isspace(static_cast<unsigned char>(value[end - 1])) != 0) {
        --end;
    }

    return value.substr(begin, end - begin);
}

std::string httpDate() {
    std::time_t now = std::time(nullptr);
    std::tm utcTime = {};
#if defined(_WIN32)
    gmtime_s(&utcTime, &now);
#else
    utcTime = *std::gmtime(&now);
#endif
    char buffer[128];
    std::strftime(buffer, sizeof(buffer), "%a, %d %b %Y %H:%M:%S GMT", &utcTime);
    return buffer;
}

std::string guessContentType(const std::string& path, const std::string& body = "") {
    if (body.size() >= 8 &&
        static_cast<unsigned char>(body[0]) == 0x89 &&
        body[1] == 'P' &&
        body[2] == 'N' &&
        body[3] == 'G' &&
        static_cast<unsigned char>(body[4]) == 0x0D &&
        static_cast<unsigned char>(body[5]) == 0x0A &&
        static_cast<unsigned char>(body[6]) == 0x1A &&
        static_cast<unsigned char>(body[7]) == 0x0A) {
        return "image/png";
    }

    if (body.size() >= 3 &&
        static_cast<unsigned char>(body[0]) == 0xFF &&
        static_cast<unsigned char>(body[1]) == 0xD8 &&
        static_cast<unsigned char>(body[2]) == 0xFF) {
        return "image/jpeg";
    }

    if (path.size() >= 5 && path.substr(path.size() - 5) == ".html") {
        return "text/html; charset=UTF-8";
    }
    if (path.size() >= 4 && path.substr(path.size() - 4) == ".css") {
        return "text/css; charset=UTF-8";
    }
    if (path.size() >= 3 && path.substr(path.size() - 3) == ".js") {
        return "application/javascript; charset=UTF-8";
    }
    if (path.size() >= 4 && path.substr(path.size() - 4) == ".jpg") {
        return "image/jpeg";
    }
    if (path.size() >= 5 && path.substr(path.size() - 5) == ".jpeg") {
        return "image/jpeg";
    }
    if (path.size() >= 4 && path.substr(path.size() - 4) == ".png") {
        return "image/png";
    }
    if (path.size() >= 4 && path.substr(path.size() - 4) == ".ico") {
        return "image/x-icon";
    }
    return "text/plain; charset=UTF-8";
}

bool fileExists(const std::string& path) {
    std::ifstream input(path.c_str(), std::ios::binary);
    return input.good();
}

bool isSafePath(const std::string& target) {
    return target.find("..") == std::string::npos &&
           target.find('\\') == std::string::npos &&
           !target.empty() &&
           target[0] == '/';
}

std::string resolveTargetPath(const std::string& target) {
    if (target == "/") {
        return std::string(kWebRoot) + "index.html";
    }

    if (!isSafePath(target)) {
        return "";
    }

    return std::string(kWebRoot) + target.substr(1);
}

SOCKET bindListeningSocket(int& selectedPort) {
    const int ports[] = {kPreferredPort, 8080, 8082};

    for (int port : ports) {
        SOCKET listenSocket = socket(AF_INET, SOCK_STREAM, IPPROTO_TCP);
        if (listenSocket == INVALID_SOCKET) {
            continue;
        }

        BOOL reuseAddress = 1;
        setsockopt(listenSocket, SOL_SOCKET, SO_REUSEADDR,
                   reinterpret_cast<const char*>(&reuseAddress), sizeof(reuseAddress));

        sockaddr_in service = {};
        service.sin_family = AF_INET;
        service.sin_addr.s_addr = htonl(INADDR_ANY);
        service.sin_port = htons(static_cast<u_short>(port));

        if (bind(listenSocket, reinterpret_cast<sockaddr*>(&service), sizeof(service)) == SOCKET_ERROR) {
            closesocket(listenSocket);
            continue;
        }

        if (listen(listenSocket, SOMAXCONN) == SOCKET_ERROR) {
            closesocket(listenSocket);
            continue;
        }

        selectedPort = port;
        return listenSocket;
    }

    selectedPort = -1;
    return INVALID_SOCKET;
}

bool readHttpRequest(SOCKET clientSocket, std::string& rawRequest) {
    rawRequest.clear();
    char buffer[4096];

    while (rawRequest.find("\r\n\r\n") == std::string::npos && rawRequest.size() < kMaxRequestSize) {
        int received = recv(clientSocket, buffer, sizeof(buffer), 0);
        if (received == 0) {
            break;
        }
        if (received == SOCKET_ERROR) {
            return false;
        }
        rawRequest.append(buffer, buffer + received);
    }

    return !rawRequest.empty();
}

bool parseHttpRequest(const std::string& rawRequest, HttpRequest& request) {
    std::size_t lineEnd = rawRequest.find("\r\n");
    if (lineEnd == std::string::npos) {
        return false;
    }

    std::istringstream lineStream(rawRequest.substr(0, lineEnd));
    if (!(lineStream >> request.method >> request.target >> request.version)) {
        return false;
    }

    return request.version == "HTTP/1.1" || request.version == "HTTP/1.0";
}

std::string buildHttpResponse(const HttpResponse& response) {
    std::ostringstream stream;
    stream << "HTTP/1.1 " << response.statusCode << ' ' << response.reason << "\r\n";
    stream << "Date: " << httpDate() << "\r\n";
    stream << "Server: FuzhouPulse/1.0\r\n";
    stream << "Content-Type: " << response.contentType << "\r\n";
    stream << "Content-Length: " << response.body.size() << "\r\n";
    for (const std::string& header : response.extraHeaders) {
        stream << header << "\r\n";
    }
    stream << "Connection: close\r\n";
    stream << "Cache-Control: no-store\r\n";
    stream << "\r\n";
    if (!response.headOnly) {
        stream << response.body;
    }
    return stream.str();
}

HttpResponse makeResponseForRequest(const HttpRequest& request) {
    const bool headOnly = request.method == "HEAD";
    if (request.method != "GET" && request.method != "HEAD") {
        return HttpResponse{
            405,
            "Method Not Allowed",
            "text/html; charset=UTF-8",
            "<!DOCTYPE html><html><body><h1>405 Method Not Allowed</h1></body></html>",
            headOnly,
            {}
        };
    }

    std::string target = request.target;
    std::size_t queryPos = target.find('?');
    if (queryPos != std::string::npos) {
        target = target.substr(0, queryPos);
    }

    if (target == "/api/count") {
        return HttpResponse{
            200,
            "OK",
            "text/plain; charset=UTF-8",
            std::to_string(visitorCount),
            headOnly,
            {"Access-Control-Allow-Origin: *"}
        };
    }

    if (request.method == "GET" && (target == "/" || target == "/index.html")) {
        ++visitorCount;
        saveVisitorCount();
    }

    const std::string filePath = resolveTargetPath(target);
    if (filePath.empty() || !fileExists(filePath)) {
        return HttpResponse{
            404,
            "Not Found",
            "text/html; charset=UTF-8",
            "<!DOCTYPE html><html><body><h1>404 Not Found</h1></body></html>",
            headOnly,
            {}
        };
    }

    const std::string body = loadFile(filePath);
    return HttpResponse{
        200,
        "OK",
        guessContentType(filePath, body),
        body,
        headOnly,
        {}
    };
}

bool sendAll(SOCKET clientSocket, const std::string& data) {
    int totalSent = 0;
    while (totalSent < static_cast<int>(data.size())) {
        int sent = send(clientSocket, data.c_str() + totalSent,
                        static_cast<int>(data.size()) - totalSent, 0);
        if (sent == SOCKET_ERROR) {
            return false;
        }
        totalSent += sent;
    }
    return true;
}

void logRequestLine(const HttpRequest& request) {
    std::cout << "Handled request: "
              << trim(request.method) << ' '
              << trim(request.target) << ' '
              << trim(request.version) << std::endl;
}

}  // namespace

int main() {
    WSADATA wsaData;
    int startupResult = WSAStartup(MAKEWORD(2, 2), &wsaData);
    if (startupResult != 0) {
        std::cerr << "WSAStartup failed: " << startupResult << std::endl;
        return 1;
    }

    int port = -1;
    SOCKET listenSocket = bindListeningSocket(port);
    if (listenSocket == INVALID_SOCKET) {
        std::cerr << "Failed to bind to ports 8081, 8080, or 8082." << std::endl;
        WSACleanup();
        return 1;
    }

    loadVisitorCount();
    writePortFile(port);
    std::cout << "Server listening on http://0.0.0.0:" << port << std::endl;
    std::cout << "Initial visitor count: " << visitorCount << std::endl;
    std::cout << "Server is running and will stay alive until you stop it." << std::endl;

    while (true) {
        SOCKET clientSocket = accept(listenSocket, nullptr, nullptr);
        if (clientSocket == INVALID_SOCKET) {
            std::cerr << "accept failed: " << WSAGetLastError() << std::endl;
            closesocket(listenSocket);
            WSACleanup();
            return 1;
        }

        std::string rawRequest;
        if (!readHttpRequest(clientSocket, rawRequest)) {
            std::cerr << "recv failed: " << WSAGetLastError() << std::endl;
            closesocket(clientSocket);
            continue;
        }

        HttpRequest request;
        HttpResponse response;
        if (!parseHttpRequest(rawRequest, request)) {
            response = HttpResponse{
                400,
                "Bad Request",
                "text/html; charset=UTF-8",
                "<!DOCTYPE html><html><body><h1>400 Bad Request</h1></body></html>",
                false,
                {}
            };
        } else {
            response = makeResponseForRequest(request);
            logRequestLine(request);
        }

        const std::string responseText = buildHttpResponse(response);
        if (!sendAll(clientSocket, responseText)) {
            std::cerr << "send failed: " << WSAGetLastError() << std::endl;
            closesocket(clientSocket);
            continue;
        }

        shutdown(clientSocket, SD_SEND);
        closesocket(clientSocket);
    }

    closesocket(listenSocket);
    WSACleanup();
    return 0;
}
