/**
 * Quick diagnostic helper for Authorization header issues
 * Add this to a page temporarily to test if headers are being sent
 */

export async function testHeadersPassthrough() {
  const token = localStorage.getItem('token');

  if (!token) {
    console.log('Test: No token in localStorage');
    return;
  }

  console.log('Test: Sending request with Authorization header...');

  try {
    const response = await fetch('/api/v1/debug/headers', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ test: true }),
    });

    const data = await response.json();
    console.log('Test: Proxy received headers:', data);

    if (data.headers.authorization === 'MISSING') {
      console.error(
        'CRITICAL: Authorization header not reaching proxy! Browser or proxy stripping it.',
      );
    } else if (data.headers.authorization.startsWith('Bearer ')) {
      console.log('GOOD: Authorization header successfully forwarded to proxy');
    }
  } catch (error) {
    console.error('Test failed:', error);
  }
}
