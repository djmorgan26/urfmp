from setuptools import setup, find_packages

with open("README.md", "r", encoding="utf-8") as fh:
    long_description = fh.read()

setup(
    name="urfmp-sdk",
    version="0.1.0",
    author="URFMP Team",
    author_email="support@urfmp.com",
    description="Python SDK for URFMP - Connect any robot in 7 lines of code",
    long_description=long_description,
    long_description_content_type="text/markdown",
    url="https://github.com/urfmp/urfmp",
    packages=find_packages(),
    classifiers=[
        "Development Status :: 3 - Alpha",
        "Intended Audience :: Developers",
        "Topic :: Software Development :: Libraries :: Python Modules",
        "License :: OSI Approved :: MIT License",
        "Programming Language :: Python :: 3",
        "Programming Language :: Python :: 3.8",
        "Programming Language :: Python :: 3.9",
        "Programming Language :: Python :: 3.10",
        "Programming Language :: Python :: 3.11",
    ],
    python_requires=">=3.8",
    install_requires=[
        "websockets>=11.0",
        "asyncio>=3.4",
        "typing-extensions>=4.0",
    ],
    extras_require={
        "dev": [
            "pytest>=7.0",
            "pytest-asyncio>=0.21",
            "black>=23.0",
            "flake8>=6.0",
        ],
        "ros": [
            "roslibpy>=1.5",
        ],
    },
)
