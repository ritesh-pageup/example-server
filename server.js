const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'your-refresh-secret-key';

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Request logging middleware
app.use((req, res, next) => {
  console.log(`\n${new Date().toISOString()} - ${req.method} ${req.path}`);
  console.log('Headers:', req.headers);
  console.log('Body:', req.body);
  console.log('Query:', req.query);
  next();
});

class User {
  constructor(email, password, name) {
    this.id = uuidv4();
    this.email = email;
    this.password = password;
    this.name = name;
    this.avatar = null;
    this.createdAt = new Date().toISOString();
    this.updatedAt = new Date().toISOString();
  }
}

class Product {
  constructor(name, description, price, image, category, stock) {
    this.id = uuidv4();
    this.name = name;
    this.description = description;
    this.price = price;
    this.image = image;
    this.category = category;
    this.stock = stock || 0;
    this.createdAt = new Date().toISOString();
    this.updatedAt = new Date().toISOString();
  }
}

const db = {
  users: [],
  products: [],
  refreshTokens: []
};

const hashPassword = async (password) => {
  return await bcrypt.hash(password, 10);
};

const verifyPassword = async (password, hash) => {
  return await bcrypt.compare(password, hash);
};

const generateTokens = (user) => {
  const userWithoutPassword = {
    id: user.id,
    email: user.email,
    name: user.name,
    avatar: user.avatar
  };

  const token = jwt.sign(
    { userId: user.id, email: user.email },
    JWT_SECRET,
    { expiresIn: '1h' }
  );

  const refreshToken = jwt.sign(
    { userId: user.id, email: user.email },
    JWT_REFRESH_SECRET,
    { expiresIn: '7d' }
  );

  return { token, refreshToken, user: userWithoutPassword };
};

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Authentication required' });
  }

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(403).json({ message: 'Invalid or expired token' });
    }
    req.userId = decoded.userId;
    req.userEmail = decoded.email;
    next();
  });
};

const initializeSampleData = async () => {
  const hashedPassword = await hashPassword('password123');

  db.users.push(new User('john@example.com', hashedPassword, 'John Doe'));
  db.users.push(new User('jane@example.com', hashedPassword, 'Jane Smith'));
  db.users.push(new User('test@example.com', hashedPassword, 'Test User'));

  db.products.push(new Product(
    'Laptop',
    'High-performance laptop with 16GB RAM',
    999.99,
    'https://via.placeholder.com/300x200',
    'Electronics',
    10
  ));
  db.products.push(new Product(
    'Wireless Mouse',
    'Ergonomic wireless mouse with long battery life',
    29.99,
    'https://via.placeholder.com/300x200',
    'Accessories',
    50
  ));
  db.products.push(new Product(
    'Mechanical Keyboard',
    'RGB mechanical keyboard with cherry MX switches',
    89.99,
    'https://via.placeholder.com/300x200',
    'Accessories',
    30
  ));
  db.products.push(new Product(
    '4K Monitor',
    '27-inch 4K IPS monitor with HDR',
    399.99,
    'https://via.placeholder.com/300x200',
    'Electronics',
    15
  ));
  db.products.push(new Product(
    'Headphones',
    'Noise-cancelling wireless headphones',
    199.99,
    'https://via.placeholder.com/300x200',
    'Audio',
    20
  ));
};

app.get('/', (req, res) => {
  res.json({
    message: 'API Server Running',
    endpoints: {
      auth: {
        login: 'POST /auth/login',
        signup: 'POST /auth/signup',
        logout: 'POST /auth/logout',
        refresh: 'POST /auth/refresh'
      },
      user: {
        profile: 'GET /user/profile',
        updateProfile: 'PUT /user/profile',
        deleteAccount: 'DELETE /user/account'
      },
      products: {
        list: 'GET /products',
        detail: 'GET /products/:id',
        create: 'POST /products',
        update: 'PUT /products/:id',
        delete: 'DELETE /products/:id'
      }
    }
  });
});

app.post('/auth/signup', async (req, res) => {
  try {
    const { email, password, name } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: 'Email and password are required'
      });
    }

    const existingUser = db.users.find(u => u.email === email);
    if (existingUser) {
      return res.status(400).json({
        message: 'Email already exists'
      });
    }

    const hashedPassword = await hashPassword(password);
    const newUser = new User(email, hashedPassword, name || email.split('@')[0]);
    db.users.push(newUser);

    const { token, refreshToken, user } = generateTokens(newUser);
    db.refreshTokens.push({ token: refreshToken, userId: user.id });

    res.status(201).json({
      token,
      refreshToken,
      user
    });
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
});

app.post('/auth/login', async (req, res) => {
  try {
    console.log('\n=== LOGIN ATTEMPT ===');
    console.log('Request body:', req.body);

    const { email, password } = req.body;
    console.log('Extracted email:', email);
    console.log('Extracted password:', password ? '[PROVIDED]' : '[MISSING]');

    if (!email || !password) {
      console.log('Missing email or password');
      return res.status(400).json({
        message: 'Email and password are required'
      });
    }

    console.log('Looking for user with email:', email);
    console.log('Available users:', db.users.map(u => ({ email: u.email, id: u.id })));

    const user = db.users.find(u => u.email === email);
    if (!user) {
      console.log('User not found');
      return res.status(401).json({
        message: 'Invalid email or password'
      });
    }

    console.log('User found:', { email: user.email, id: user.id });
    console.log('Verifying password...');

    const isValidPassword = await verifyPassword(password, user.password);
    console.log('Password valid:', isValidPassword);

    if (!isValidPassword) {
      console.log('Invalid password');
      return res.status(401).json({
        message: 'Invalid email or password'
      });
    }

    console.log('Generating tokens...');
    const { token, refreshToken, user: userResponse } = generateTokens(user);
    db.refreshTokens.push({ token: refreshToken, userId: user.id });

    console.log('Login successful for user:', userResponse.email);
    res.json({
      token,
      refreshToken,
      user: userResponse
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

app.post('/auth/logout', authenticateToken, (req, res) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  db.refreshTokens = db.refreshTokens.filter(rt => rt.userId !== req.userId);

  res.json({ message: 'Logged out successfully' });
});

app.post('/auth/refresh', async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({ message: 'Refresh token required' });
    }

    const storedToken = db.refreshTokens.find(rt => rt.token === refreshToken);
    if (!storedToken) {
      return res.status(403).json({ message: 'Invalid refresh token' });
    }

    jwt.verify(refreshToken, JWT_REFRESH_SECRET, (err, decoded) => {
      if (err) {
        db.refreshTokens = db.refreshTokens.filter(rt => rt.token !== refreshToken);
        return res.status(403).json({ message: 'Invalid or expired refresh token' });
      }

      const user = db.users.find(u => u.id === decoded.userId);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      const { token, refreshToken: newRefreshToken, user: userResponse } = generateTokens(user);

      db.refreshTokens = db.refreshTokens.filter(rt => rt.token !== refreshToken);
      db.refreshTokens.push({ token: newRefreshToken, userId: user.id });

      res.json({
        token,
        refreshToken: newRefreshToken,
        user: userResponse
      });
    });
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
});

app.get('/user/profile', authenticateToken, (req, res) => {
  const user = db.users.find(u => u.id === req.userId);

  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }

  const { password, ...userWithoutPassword } = user;
  res.json(userWithoutPassword);
});

app.put('/user/profile', authenticateToken, async (req, res) => {
  const { name, avatar, email, password } = req.body;
  const userIndex = db.users.findIndex(u => u.id === req.userId);

  if (userIndex === -1) {
    return res.status(404).json({ message: 'User not found' });
  }

  if (email && email !== db.users[userIndex].email) {
    const emailExists = db.users.find(u => u.email === email && u.id !== req.userId);
    if (emailExists) {
      return res.status(400).json({ message: 'Email already exists' });
    }
    db.users[userIndex].email = email;
  }

  if (name) db.users[userIndex].name = name;
  if (avatar) db.users[userIndex].avatar = avatar;
  if (password) {
    db.users[userIndex].password = await hashPassword(password);
  }

  db.users[userIndex].updatedAt = new Date().toISOString();

  const { password: _, ...userWithoutPassword } = db.users[userIndex];
  res.json(userWithoutPassword);
});

app.delete('/user/account', authenticateToken, (req, res) => {
  const userIndex = db.users.findIndex(u => u.id === req.userId);

  if (userIndex === -1) {
    return res.status(404).json({ message: 'User not found' });
  }

  db.users.splice(userIndex, 1);
  db.refreshTokens = db.refreshTokens.filter(rt => rt.userId !== req.userId);

  res.json({ message: 'Account deleted successfully' });
});

app.get('/products', (req, res) => {
  const { page = 1, limit = 10, category, search } = req.query;
  const pageNum = parseInt(page);
  const limitNum = parseInt(limit);

  let filteredProducts = [...db.products];

  if (category) {
    filteredProducts = filteredProducts.filter(p =>
      p.category && p.category.toLowerCase() === category.toLowerCase()
    );
  }

  if (search) {
    filteredProducts = filteredProducts.filter(p =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      (p.description && p.description.toLowerCase().includes(search.toLowerCase()))
    );
  }

  const startIndex = (pageNum - 1) * limitNum;
  const endIndex = startIndex + limitNum;
  const paginatedProducts = filteredProducts.slice(startIndex, endIndex);

  res.json({
    products: paginatedProducts,
    total: filteredProducts.length,
    page: pageNum,
    limit: limitNum
  });
});

app.get('/products/:id', (req, res) => {
  const product = db.products.find(p => p.id === req.params.id);

  if (!product) {
    return res.status(404).json({ message: 'Product not found' });
  }

  res.json(product);
});

app.post('/products', authenticateToken, (req, res) => {
  const { name, description, price, image, category, stock } = req.body;

  if (!name || price === undefined) {
    return res.status(400).json({ message: 'Name and price are required' });
  }

  const newProduct = new Product(name, description, price, image, category, stock);
  db.products.push(newProduct);

  res.status(201).json(newProduct);
});

app.put('/products/:id', authenticateToken, (req, res) => {
  const productIndex = db.products.findIndex(p => p.id === req.params.id);

  if (productIndex === -1) {
    return res.status(404).json({ message: 'Product not found' });
  }

  const { name, description, price, image, category, stock } = req.body;

  if (name) db.products[productIndex].name = name;
  if (description !== undefined) db.products[productIndex].description = description;
  if (price !== undefined) db.products[productIndex].price = price;
  if (image !== undefined) db.products[productIndex].image = image;
  if (category !== undefined) db.products[productIndex].category = category;
  if (stock !== undefined) db.products[productIndex].stock = stock;

  db.products[productIndex].updatedAt = new Date().toISOString();

  res.json(db.products[productIndex]);
});

app.delete('/products/:id', authenticateToken, (req, res) => {
  const productIndex = db.products.findIndex(p => p.id === req.params.id);

  if (productIndex === -1) {
    return res.status(404).json({ message: 'Product not found' });
  }

  db.products.splice(productIndex, 1);
  res.status(204).send();
});

app.use((req, res) => {
  res.status(404).json({ message: 'Endpoint not found' });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Internal server error' });
});

initializeSampleData().then(() => {
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server is running on:`);
    console.log(`- Local: http://localhost:${PORT}`);
    console.log(`- Network: http://192.168.1.17:${PORT}`);
    console.log(`API documentation available at http://192.168.1.17:${PORT}/`);
    console.log('\nTest credentials:');
    console.log('Email: test@example.com');
    console.log('Password: password123');
  });
});