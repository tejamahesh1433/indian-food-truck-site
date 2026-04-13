import bcrypt from 'bcryptjs';

const password = process.argv[2];

if (!password) {
  console.log('Usage: node scripts/hash-password.mjs <your-password>');
  process.exit(1);
}

const salt = bcrypt.genSaltSync(10);
const hash = bcrypt.hashSync(password, salt);

console.log('----------------------------------------');
console.log('YOUR PASSWORD HASH:');
console.log(hash);
console.log('----------------------------------------');
console.log('Copy the hash above and paste it into your .env file:');
console.log('ADMIN_PASSWORD=' + hash);
console.log('----------------------------------------');
