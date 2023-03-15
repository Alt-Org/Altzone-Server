@echo off
set URL=http://localhost:8080/clan/6411cd209a79de3c1987b398
set CONTENT_OPTIONS=-H "Content-type: application/json" -H "Accept: application/json"
echo GET %URL%
curl %1 %URL% %CONTENT_OPTIONS%
