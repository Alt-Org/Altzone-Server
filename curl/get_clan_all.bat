@echo off
set URL=http://localhost:8080/clan
set CONTENT_OPTIONS=-H "Content-type: application/json" -H "Accept: application/json"
echo GET %URL%
curl %1 %URL% %CONTENT_OPTIONS%
