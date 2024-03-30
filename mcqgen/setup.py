# locale pckg for virtual env
from setuptools import find_packages, setup


setup(
    name='mcqgenerator',
    version='0.0.1',
    author='aniket',
    author_email='aniket.umbc@gmail.com',
    install_requires=['openai', 'langchain',
                      'stremlit', 'python-dotenv', 'PyPDF2'],
    packages=find_packages()
)
