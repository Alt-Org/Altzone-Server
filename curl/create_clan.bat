@echo off
set URL=http://localhost:8080/clan
set CONTENT_OPTIONS=-H "Content-type: application/json"
echo POST %URL%
curl %1 -X POST %URL% %CONTENT_OPTIONS% -d @create_clan.json
