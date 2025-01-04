import os
import struct
from io import BytesIO
import PyPDF2
import sys

class CAJConverter:
    def __init__(self, caj_path):
        self.caj_path = caj_path
        self.pdf_data = None
        
    def convert(self, output_path):
        try:
            print("读取CAJ文件...", file=sys.stderr)
            # 读取CAJ文件
            with open(self.caj_path, 'rb') as f:
                caj_data = f.read()
            
            print("检查文件格式...", file=sys.stderr)
            # 检查文件格式
            if not self._is_valid_caj(caj_data):
                raise ValueError("无效的CAJ文件格式")
            
            print("提取PDF数据...", file=sys.stderr)
            # 提取PDF数据
            self.pdf_data = self._extract_pdf(caj_data)
            
            print("写入PDF文件...", file=sys.stderr)
            # 写入PDF文件
            with open(output_path, 'wb') as f:
                f.write(self.pdf_data)
            
            print("转换完成", file=sys.stderr)
            return True
        except Exception as e:
            print(f"转换失败: {str(e)}", file=sys.stderr)
            raise
    
    def _is_valid_caj(self, data):
        # 检查文件头
        if len(data) < 8:
            return False
        magic = struct.unpack('<Q', data[:8])[0]
        return magic in [0x0123456789ABCDEF, 0xFEDCBA9876543210]
    
    def _extract_pdf(self, data):
        # 查找PDF头
        pdf_start = data.find(b'%PDF-')
        if pdf_start == -1:
            raise ValueError("找不到PDF数据")
        
        # 查找PDF尾
        pdf_end = data.rfind(b'%%EOF')
        if pdf_end == -1:
            raise ValueError("找不到PDF结束标记")
        
        # 提取PDF数据
        pdf_data = data[pdf_start:pdf_end+5]
        
        # 验证PDF数据
        try:
            reader = PyPDF2.PdfReader(BytesIO(pdf_data))
            if len(reader.pages) == 0:
                raise ValueError("无效的PDF数据")
        except:
            raise ValueError("无效的PDF数据")
        
        return pdf_data 