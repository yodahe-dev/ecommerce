### Updated README: React + Node.js + MySQL Starter

---

#### **Role Requirement**  
Every user **must** have a valid role assigned at creation. This is enforced by:  
1. `roleId` as a required foreign key in the User model  
2. Database constraint linking to the Roles table  
3. Default role assignment using `DEFAULT_ROLE` from `.env`  
4. Backend validation preventing user creation without a role  

---

#### **Setup Instructions**  
**1. Configure Environment (.env)**  
```ini
# BACKEND/.env
DB_NAME=your_db_name
DB_USER=your_db_user
DB_PASS=your_db_password
DB_HOST=127.0.0.1
DB_DIALECT=mysql
JWT_SECRET=secure_random_string
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=app_specific_password
DEFAULT_ROLE=user  # Must match role name in database
```

**2. Seed Required Roles**  
Run this SQL **before** starting the app:  
```sql
INSERT INTO Roles (id, name) VALUES 
(UUID(), 'admin'),
(UUID(), 'manager'),
(UUID(), 'user');  -- Must match DEFAULT_ROLE
```

**3. Start Application**  
```bash
# Backend
cd backend
npm install
npx sequelize-cli db:create
npx sequelize-cli db:migrate
npm start

# Frontend
cd frontend
npm install
npm run dev
```

---

#### **Role Assignment Workflow**  
1. **Signup**:  
   - System checks `DEFAULT_ROLE` from `.env`  
   - Assigns corresponding role to new user  
   - Fails if role doesn't exist in database  

2. **Role Verification**:  
   ```javascript
   // Backend middleware
   const checkRole = (requiredRoles) => {
     return (req, res, next) => {
       if (!requiredRoles.includes(req.user.role)) 
         return res.status(403).json({ error: 'Forbidden' });
       next();
     };
   };
   ```

3. **Frontend Protection**:  
   ```jsx
   // ProtectedRoute.jsx
   <ProtectedRoute 
     requiredRoles={['admin', 'manager']}
     userRole={currentUser.role}
   >
     <AdminDashboard />
   </ProtectedRoute>
   ```

---

#### **Role Management**  
| Action | Method |  
|--------|--------|  
| **Change Default Role** | Update `DEFAULT_ROLE` in `.env` |  
| **Add New Role** | Insert into Roles table via SQL |  
| **Assign Custom Role** | Modify user's `roleId` in database |  
| **Restrict Access** | Update `checkRole` middleware |  

---

#### **Critical Role-Related Files**  
| Path | Purpose |  
|------|---------|  
| `backend/models/role.js` | Role schema definition |  
| `backend/models/user.js` | `roleId` foreign key constraint |  
| `backend/routes/auth.js` | Default role assignment on signup |  
| `frontend/setting/ProtectedRoute.jsx` | Frontend role guard |  
| `backend/middlewares/auth.js` | `checkRole` middleware |  

---

#### **Troubleshooting Roles**  
**Error**: `"Default role not found"`  
✅ **Solution**:  
1. Verify `DEFAULT_ROLE` in `.env` matches role name in database  
2. Confirm roles exist in database (run `SELECT * FROM Roles;`)  

**Error**: `"Forbidden" on authorized routes`  
✅ **Solution**:  
1. Check user's roleId in database matches valid role  
2. Update `requiredRoles` array in frontend/backend guards  

---

> ⚠️ **Never run without valid roles** - The system requires at least the `DEFAULT_ROLE` to exist in the database before user signup. Use the provided SQL snippet to initialize roles.# StackAttack
