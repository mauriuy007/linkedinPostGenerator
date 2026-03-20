import express from 'express'; 
import authRoutes from './routes/auth.routes.js';
const app = express();
const PORT = 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/api/auth', authRoutes);

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
