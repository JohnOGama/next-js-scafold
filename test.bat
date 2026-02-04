@echo off
REM Test script for scafold package (Windows)

echo 🧪 Testing Scafold Package
echo ==========================
echo.

REM Step 1: Install dependencies
echo 📦 Step 1: Installing dependencies...
call npm install

REM Step 2: Build
echo.
echo 🔨 Step 2: Building TypeScript...
call npm run build

REM Step 3: Link
echo.
echo 🔗 Step 3: Linking package globally...
call npm link

REM Step 4: Test
echo.
echo ✅ Step 4: Testing CLI...
echo Creating test project: test-scafold-output
cd ..
call scafold test-scafold-output --yes

REM Step 5: Verify
echo.
echo 🔍 Step 5: Verifying generated project...
if exist "test-scafold-output" (
    echo ✅ Project directory created!
    if exist "test-scafold-output\package.json" (
        echo ✅ package.json exists!
    )
    if exist "test-scafold-output\src\app\page.tsx" (
        echo ✅ Source files created!
    )
    echo.
    echo 🎉 Test completed successfully!
    echo.
    echo To clean up, run:
    echo   rmdir /s test-scafold-output
    echo   cd scafold-repo ^&^& npm unlink -g scafold
) else (
    echo ❌ Project directory not found!
    exit /b 1
)
