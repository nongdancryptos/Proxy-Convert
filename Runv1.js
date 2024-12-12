const fs = require('fs');
const path = require('path');
const readline = require('readline');

// Tạo interface để nhập từ người dùng
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

// Đường dẫn đến file input
const inputFilePath = path.join(__dirname, 'proxy.txt');

// Hỏi người dùng về loại proxy và định dạng muốn sử dụng
rl.question('Chọn loại proxy muốn sử dụng (1 - http, 2 - socks4, 3 - socks5, 4 - không gắn biến): ', (answer) => {
    rl.question('Chọn định dạng proxy (1 - ip:port, 2 - user:pass@ip:port, 3 - user:pass:ip:port): ', (formatAnswer) => {
        let prefix;
        let outputFileName;

        // Chọn prefix và outputFileName tùy theo loại proxy
        switch (answer) {
            case '1':
                prefix = 'http://'; // Chọn http:// cho proxy HTTP
                outputFileName = 'http_proxies.txt';
                break;
            case '2':
                prefix = 'socks4://';
                outputFileName = 'socks4_proxies.txt';
                break;
            case '3':
                prefix = 'socks5://';
                outputFileName = 'socks5_proxies.txt';
                break;
            case '4':
                // Chức năng chuyển đổi mà không gắn biến
                outputFileName = 'converted_proxies.txt';
                processWithoutPrefix(formatAnswer);
                rl.close();
                return;
            default:
                console.error('Lựa chọn không hợp lệ. Vui lòng chọn 1, 2, 3 hoặc 4.');
                rl.close();
                return;
        }

        // Đường dẫn đến file output
        const outputFilePath = path.join(__dirname, outputFileName);

        // Xóa file cũ nếu tồn tại
        fs.unlink(outputFilePath, (err) => {
            if (err && err.code !== 'ENOENT') {
                console.error(`Lỗi khi xóa file ${outputFileName}:`, err);
                rl.close();
                return;
            }

            // Đọc file proxy.txt
            fs.readFile(inputFilePath, 'utf8', (err, data) => {
                if (err) {
                    console.error('Lỗi khi đọc file proxy.txt:', err);
                    rl.close();
                    return;
                }

                // Tách các proxy thành từng dòng
                const proxies = data.split('\n').map(line => line.trim()).filter(line => line.length > 0);

                // Thêm định dạng tương ứng vào mỗi proxy
                const formattedProxies = proxies.map(proxy => {
                    let formattedProxy = proxy;

                    // Nếu proxy có định dạng ip:port:user:pass
                    const parts = proxy.split(':');
                    if (parts.length === 4) {
                        const [ip, port, user, pass] = parts;
                        formattedProxy = `${user}:${pass}@${ip}:${port}`;
                    }

                    // Thêm prefix vào định dạng
                    return `${prefix}${formattedProxy}`;
                });

                // Ghi ra file theo tên đã chọn
                fs.writeFile(outputFilePath, formattedProxies.join('\n'), 'utf8', (err) => {
                    if (err) {
                        console.error(`Lỗi khi ghi file ${outputFileName}:`, err);
                    } else {
                        console.log(`Đã ghi thành công vào ${outputFileName}`);
                    }
                    rl.close();
                });
            });
        });
    });
});

// Hàm xử lý chuyển đổi mà không gắn biến
function processWithoutPrefix(formatAnswer) {
    const data = fs.readFileSync(inputFilePath, 'utf8');
    const proxies = data.split('\n').map(line => line.trim()).filter(line => line.length > 0);

    const formattedProxies = proxies.map(proxy => {
        let formattedProxy = proxy;

        // Nếu proxy có định dạng ip:port:user:pass
        const parts = proxy.split(':');
        if (parts.length === 4) {
            const [ip, port, user, pass] = parts;
            formattedProxy = `${user}:${pass}@${ip}:${port}`;
        }

        return formattedProxy;
    });

    // Ghi kết quả vào file mà không cần gắn tiền tố (prefix)
    const outputFilePath = path.join(__dirname, 'converted_proxies.txt');
    fs.writeFileSync(outputFilePath, formattedProxies.join('\n'), 'utf8');
    console.log('Đã ghi thành công vào converted_proxies.txt');
}
