const request = require('supertest');
const { expect } = require('chai');
const app = require('../server');

describe('Login Application', () => {
    it('should return 200 OK on health check endpoint', async () => {
        const response = await request(app).get('/health');
        expect(response.status).to.equal(200);
        expect(response.body.status).to.equal('ok');
    });

    it('should serve the login page', async () => {
        const response = await request(app).get('/');
        expect(response.status).to.equal(200);
        expect(response.text).to.include('Login');
    });

    it('should handle login POST request', async () => {
        const response = await request(app)
            .post('/login')
            .send('username=admin&password=password')  // Send as URL-encoded form data
            .set('Content-Type', 'application/x-www-form-urlencoded');
        
        console.log('Response body:', response.text); // Debug log
        expect(response.status).to.equal(200);
        expect(response.text).to.include('Login Successful');
    });

    it('should handle invalid login POST request', async () => {
        const response = await request(app)
            .post('/login')
            .send('username=wrong&password=wrong')  // Send as URL-encoded form data
            .set('Content-Type', 'application/x-www-form-urlencoded');
        expect(response.status).to.equal(200);
        expect(response.text).to.include('Login Failed');
    });
});
