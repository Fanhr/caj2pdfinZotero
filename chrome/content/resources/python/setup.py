from setuptools import setup, find_packages

setup(
    name="caj2pdf",
    version="1.0.0",
    packages=find_packages(),
    install_requires=[
        "PyPDF2>=2.0.0",
        "mupdf>=1.19.0"
    ],
    entry_points={
        "console_scripts": [
            "caj2pdf=caj2pdf.cli:main",
        ],
    }
) 