@echo off
IF [%1]==[-build] ( 
   rollup -c
   goto:eof
)

IF [%1]==[-build:sample] (
  rollup -c -o example/gulpfile.js
   goto:eof
)

IF [%1]==[-watch] (
  rollup -w -c
   goto:eof
)

IF [%1]==[-watch:sample] (
  rollup -c -w -o example/gulpfile.js
   goto:eof
)

IF [%1]==[-h] (
 goto help
)

echo Command not found.
echo.
goto:help
goto:eof

:help (
  echo.
  echo builder.bat -build           # build code to /dist
  echo builder.bat -build:sample    # build code to /example
  echo builder.bat -watch           # build and start watcher to /dist
  echo builder.bat -watch:sample    # build and start watcher to /example
  echo.
  goto:eof
)
