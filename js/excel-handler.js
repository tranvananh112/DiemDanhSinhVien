// Excel Handler Service for import/export functionality
class ExcelHandlerService {
    constructor() {
        this.requiredColumns = ['STT', 'MSSV', 'Tên', 'Lớp'];
        this.exportColumns = ['STT', 'MSSV', 'Tên', 'Lớp', 'Trạng thái'];
    }

    // Import Excel file và parse dữ liệu
    async importExcelFile(file) {
        return new Promise((resolve, reject) => {
            if (!file) {
                reject(new Error('Không có file được chọn'));
                return;
            }

            // Kiểm tra định dạng file
            const validTypes = [
                'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                'application/vnd.ms-excel',
                'text/csv'
            ];

            if (!validTypes.includes(file.type)) {
                reject(new Error('Định dạng file không hỗ trợ. Vui lòng chọn file Excel (.xlsx, .xls) hoặc CSV'));
                return;
            }

            const reader = new FileReader();
            
            reader.onload = (e) => {
                try {
                    const data = new Uint8Array(e.target.result);
                    const workbook = XLSX.read(data, { type: 'array' });
                    
                    // Lấy sheet đầu tiên
                    const firstSheetName = workbook.SheetNames[0];
                    const worksheet = workbook.Sheets[firstSheetName];
                    
                    // Convert sang JSON
                    const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
                    
                    // Parse và validate dữ liệu
                    const result = this.parseStudentData(jsonData);
                    resolve(result);
                    
                } catch (error) {
                    reject(new Error('Lỗi khi đọc file Excel: ' + error.message));
                }
            };

            reader.onerror = () => {
                reject(new Error('Lỗi khi đọc file'));
            };

            reader.readAsArrayBuffer(file);
        });
    }

    // Parse dữ liệu sinh viên từ Excel
    parseStudentData(jsonData) {
        if (!jsonData || jsonData.length === 0) {
            throw new Error('File Excel trống');
        }

        // Lấy header row
        const headers = jsonData[0];
        if (!headers || headers.length === 0) {
            throw new Error('Không tìm thấy header trong file Excel');
        }

        // Tìm vị trí các cột cần thiết
        const columnMap = this.mapColumns(headers);
        
        // Validate required columns
        const missingColumns = this.requiredColumns.filter(col => 
            col !== 'STT' && columnMap[col] === -1
        );

        if (missingColumns.length > 0) {
            throw new Error(`Thiếu các cột bắt buộc: ${missingColumns.join(', ')}`);
        }

        // Parse data rows
        const students = [];
        let autoSTT = 1;

        for (let i = 1; i < jsonData.length; i++) {
            const row = jsonData[i];
            if (!row || row.length === 0) continue;

            try {
                const student = this.parseStudentRow(row, columnMap, autoSTT);
                if (student) {
                    students.push(student);
                    autoSTT++;
                }
            } catch (error) {
                console.warn(`Lỗi ở dòng ${i + 1}: ${error.message}`);
            }
        }

        if (students.length === 0) {
            throw new Error('Không có dữ liệu sinh viên hợp lệ trong file');
        }

        return {
            success: true,
            students: students,
            totalRows: students.length,
            message: `Đã import thành công ${students.length} sinh viên`
        };
    }

    // Map columns từ header
    mapColumns(headers) {
        const columnMap = {};
        
        this.requiredColumns.forEach(col => {
            columnMap[col] = -1;
        });

        headers.forEach((header, index) => {
            const normalizedHeader = this.normalizeColumnName(header);
            
            // Map các tên cột khác nhau
            if (normalizedHeader.includes('stt') || normalizedHeader.includes('số thứ tự')) {
                columnMap['STT'] = index;
            } else if (normalizedHeader.includes('mssv') || normalizedHeader.includes('mã số')) {
                columnMap['MSSV'] = index;
            } else if (normalizedHeader.includes('tên') || normalizedHeader.includes('họ tên') || normalizedHeader.includes('name')) {
                columnMap['Tên'] = index;
            } else if (normalizedHeader.includes('lớp') || normalizedHeader.includes('class')) {
                columnMap['Lớp'] = index;
            }
        });

        return columnMap;
    }

    // Normalize tên cột
    normalizeColumnName(name) {
        if (!name) return '';
        return name.toString().toLowerCase().trim()
            .replace(/\s+/g, ' ')
            .replace(/[àáạảãâầấậẩẫăằắặẳẵ]/g, 'a')
            .replace(/[èéẹẻẽêềếệểễ]/g, 'e')
            .replace(/[ìíịỉĩ]/g, 'i')
            .replace(/[òóọỏõôồốộổỗơờớợởỡ]/g, 'o')
            .replace(/[ùúụủũưừứựửữ]/g, 'u')
            .replace(/[ỳýỵỷỹ]/g, 'y')
            .replace(/đ/g, 'd');
    }

    // Parse một dòng sinh viên
    parseStudentRow(row, columnMap, autoSTT) {
        const student = {};

        // STT - tự động tạo nếu không có
        if (columnMap['STT'] !== -1 && row[columnMap['STT']]) {
            student.stt = parseInt(row[columnMap['STT']]) || autoSTT;
        } else {
            student.stt = autoSTT;
        }

        // MSSV - bắt buộc
        if (columnMap['MSSV'] !== -1 && row[columnMap['MSSV']]) {
            student.studentId = row[columnMap['MSSV']].toString().trim();
        } else {
            throw new Error('MSSV không được để trống');
        }

        // Tên - bắt buộc
        if (columnMap['Tên'] !== -1 && row[columnMap['Tên']]) {
            student.name = row[columnMap['Tên']].toString().trim();
        } else {
            throw new Error('Tên sinh viên không được để trống');
        }

        // Lớp - bắt buộc
        if (columnMap['Lớp'] !== -1 && row[columnMap['Lớp']]) {
            student.class = row[columnMap['Lớp']].toString().trim();
        } else {
            throw new Error('Lớp không được để trống');
        }

        // Validate dữ liệu
        if (!student.studentId || !student.name || !student.class) {
            throw new Error('Thiếu thông tin bắt buộc');
        }

        return student;
    }

    // Export dữ liệu ra Excel
    exportToExcel(data, filename = 'diem-danh') {
        try {
            if (!data || data.length === 0) {
                throw new Error('Không có dữ liệu để xuất');
            }

            // Tạo worksheet data
            const worksheetData = [
                this.exportColumns, // Header
                ...data.map((student, index) => [
                    student.stt || index + 1,
                    student.studentId || '',
                    student.name || '',
                    student.class || '',
                    student.status || (student.timestamp ? 'C' : 'V')
                ])
            ];

            // Tạo workbook và worksheet
            const workbook = XLSX.utils.book_new();
            const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);

            // Định dạng worksheet
            this.formatWorksheet(worksheet, worksheetData);

            // Thêm worksheet vào workbook
            XLSX.utils.book_append_sheet(workbook, worksheet, 'Điểm danh');

            // Tạo filename với timestamp
            const timestamp = new Date().toISOString().split('T')[0];
            const finalFilename = `${filename}-${timestamp}.xlsx`;

            // Xuất file
            XLSX.writeFile(workbook, finalFilename);

            return {
                success: true,
                filename: finalFilename,
                message: `Đã xuất thành công ${data.length} bản ghi`
            };

        } catch (error) {
            console.error('Error exporting to Excel:', error);
            return {
                success: false,
                message: 'Lỗi khi xuất file Excel: ' + error.message
            };
        }
    }

    // Định dạng worksheet
    formatWorksheet(worksheet, data) {
        const range = XLSX.utils.decode_range(worksheet['!ref']);
        
        // Auto-fit columns
        const colWidths = [];
        for (let C = range.s.c; C <= range.e.c; ++C) {
            let maxWidth = 10;
            for (let R = range.s.r; R <= range.e.r; ++R) {
                const cellAddress = XLSX.utils.encode_cell({ r: R, c: C });
                const cell = worksheet[cellAddress];
                if (cell && cell.v) {
                    const cellLength = cell.v.toString().length;
                    maxWidth = Math.max(maxWidth, cellLength + 2);
                }
            }
            colWidths.push({ width: Math.min(maxWidth, 50) });
        }
        worksheet['!cols'] = colWidths;

        // Style header row
        for (let C = range.s.c; C <= range.e.c; ++C) {
            const headerCell = worksheet[XLSX.utils.encode_cell({ r: 0, c: C })];
            if (headerCell) {
                headerCell.s = {
                    font: { bold: true },
                    fill: { fgColor: { rgb: "CCCCCC" } },
                    alignment: { horizontal: "center" }
                };
            }
        }
    }

    // Tạo template Excel để download
    createTemplate() {
        const templateData = [
            ['STT', 'MSSV', 'Tên', 'Lớp'],
            [1, '20123456', 'Nguyễn Văn A', 'CNTT1'],
            [2, '20123457', 'Trần Thị B', 'CNTT2'],
            [3, '20123458', 'Lê Văn C', 'CNTT1']
        ];

        const workbook = XLSX.utils.book_new();
        const worksheet = XLSX.utils.aoa_to_sheet(templateData);
        
        // Định dạng template
        this.formatWorksheet(worksheet, templateData);
        
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Danh sách sinh viên');
        XLSX.writeFile(workbook, 'template-danh-sach-sinh-vien.xlsx');

        return {
            success: true,
            message: 'Template đã được tải xuống'
        };
    }

    // Validate file trước khi import
    validateFile(file) {
        const errors = [];

        if (!file) {
            errors.push('Chưa chọn file');
            return errors;
        }

        // Kiểm tra kích thước file (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            errors.push('File quá lớn (tối đa 5MB)');
        }

        // Kiểm tra định dạng
        const validTypes = [
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'application/vnd.ms-excel',
            'text/csv'
        ];

        if (!validTypes.includes(file.type)) {
            errors.push('Định dạng file không hỗ trợ');
        }

        return errors;
    }

    // Utility: Convert CSV to Excel format
    csvToExcel(csvData) {
        const rows = csvData.split('\n').map(row => row.split(','));
        return this.parseStudentData(rows);
    }

    // Utility: Get file info
    getFileInfo(file) {
        return {
            name: file.name,
            size: (file.size / 1024).toFixed(2) + ' KB',
            type: file.type,
            lastModified: new Date(file.lastModified).toLocaleString('vi-VN')
        };
    }
}

// Khởi tạo service
const excelHandler = new ExcelHandlerService();

// Export global
window.excelHandler = excelHandler;