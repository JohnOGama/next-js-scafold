#!/bin/bash

# Test script for scafold package

echo "🧪 Testing Scafold Package"
echo "=========================="
echo ""

# Step 1: Install dependencies
echo "📦 Step 1: Installing dependencies..."
npm install

# Step 2: Build
echo ""
echo "🔨 Step 2: Building TypeScript..."
npm run build

# Step 3: Link
echo ""
echo "🔗 Step 3: Linking package globally..."
npm link

# Step 4: Test
echo ""
echo "✅ Step 4: Testing CLI..."
echo "Creating test project: test-scafold-output"
cd ..
scafold test-scafold-output --yes

# Step 5: Verify
echo ""
echo "🔍 Step 5: Verifying generated project..."
if [ -d "test-scafold-output" ]; then
    echo "✅ Project directory created!"
    if [ -f "test-scafold-output/package.json" ]; then
        echo "✅ package.json exists!"
    fi
    if [ -f "test-scafold-output/src/app/page.tsx" ]; then
        echo "✅ Source files created!"
    fi
    echo ""
    echo "🎉 Test completed successfully!"
    echo ""
    echo "To clean up, run:"
    echo "  rm -rf test-scafold-output"
    echo "  cd scafold-repo && npm unlink -g scafold"
else
    echo "❌ Project directory not found!"
    exit 1
fi
