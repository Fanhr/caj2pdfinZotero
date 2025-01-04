#!/usr/bin/env python3
import os
import sys
import argparse
from io import BytesIO
from caj2pdf.converter import CAJConverter

# 获取虚拟环境的Python解释器路径
VENV_PYTHON = os.path.join(os.path.dirname(__file__), 'venv', 'bin', 'python3')

def get_python_path():
    if os.path.exists(VENV_PYTHON):
        return VENV_PYTHON
    return sys.executable

def convert_caj(input_file, output_file):
    try:
        print(f"使用Python解释器: {get_python_path()}", file=sys.stderr)
        print(f"开始转换: {input_file}", file=sys.stderr)
        print(f"输出文件: {output_file}", file=sys.stderr)
        
        # 检查输入文件
        if not os.path.exists(input_file):
            raise Exception(f"找不到输入文件: {input_file}")
        
        print("文件存在，开始转换", file=sys.stderr)
        
        # 初始化转换器
        converter = CAJConverter(input_file)
        
        # 执行转换
        print("开始执行转换", file=sys.stderr)
        converter.convert(output_file)
        
        # 验证输出
        if not os.path.exists(output_file):
            raise Exception("转换失败: 未生成PDF文件")
        
        print("转换完成", file=sys.stderr)
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