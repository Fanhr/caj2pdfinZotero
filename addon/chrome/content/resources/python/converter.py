#!/usr/bin/env python3
import os
import sys
import argparse
from caj2pdf import caj2pdf

def convert_caj(input_file, output_file):
    try:
        # 初始化转换器
        converter = caj2pdf.CAJConverter(input_file)
        
        # 执行转换
        converter.convert(output_file)
        
        return True
    except Exception as e:
        print(f"转换错误: {str(e)}", file=sys.stderr)
        return False

def main():
    parser = argparse.ArgumentParser(description='CAJ转PDF工具')
    parser.add_argument('input', help='输入CAJ文件路径')
    parser.add_argument('--output', '-o', help='输出PDF文件路径')
    
    args = parser.parse_args()
    
    # 如果未指定输出路径，使用输入文件名
    if not args.output:
        args.output = os.path.splitext(args.input)[0] + '.pdf'
    
    success = convert_caj(args.input, args.output)
    sys.exit(0 if success else 1)

if __name__ == '__main__':
    main() 