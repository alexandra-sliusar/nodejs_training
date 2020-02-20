process.stdin.setEncoding('utf-8');

process.stdin.on('data', function (data) {
  process.stdout.write(`${reverseString(data)}\n`);
});

function reverseString(s) {
  return s.trim().split('').reverse().join('');
}
