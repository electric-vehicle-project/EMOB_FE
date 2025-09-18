echo "Building app..."
npm run build
echo "Deploy files to server..."
# scp -r dist/* root@178.128.61.43:/var/www/html/
echo "Done!"