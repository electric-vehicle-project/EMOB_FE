echo "Building app..."
npm run build
echo "Deploy files to server..."
scp -r dist/* root@103.90.226.19:/var/www/html/
echo "Done!"