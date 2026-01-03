const bcrypt = require('bcrypt');

const password = process.argv[2] || 'admin123';

bcrypt.hash(password, 10).then(hash => {
  console.log('\n==============================================');
  console.log('Password Hash Generated');
  console.log('==============================================');
  console.log('Password:', password);
  console.log('Hash:', hash);
  console.log('==============================================');
  console.log('\nUse this hash in your database:');
  console.log(`\nINSERT INTO admins (email, password_hash) VALUES ('admin@looncamp.com', '${hash}');\n`);
}).catch(err => {
  console.error('Error generating hash:', err);
});
