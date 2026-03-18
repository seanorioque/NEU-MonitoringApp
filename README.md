# NEU MOA Monitoring System

A full-stack web application for monitoring Memoranda of Agreement (MOAs) at **New Era University**. Built with React, TypeScript, TailwindCSS, Firebase, and Framer Motion.
---

## 🚀 Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Firebase

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Create a new project (or use existing)
3. Enable **Authentication** → Sign-in methods → **Google**
4. Enable **Firestore Database** (start in production mode)
5. Go to **Project Settings** → Your Apps → Add Web App
6. Copy the config and paste into `src/lib/firebase.ts`:

```ts
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
};
```

7. **Update the NEU domain** in `src/lib/firebase.ts`:
```ts
googleProvider.setCustomParameters({ hd: 'neu.edu.ph' }); // your actual domain
```

8. **Update role detection** in `src/contexts/AuthContext.tsx` to match NEU's email patterns.

### 3. Deploy Firestore Rules & Indexes

```bash
npm install -g firebase-tools
firebase login
firebase use YOUR_PROJECT_ID
firebase deploy --only firestore
```

### 4. Run Locally

```bash
npm run dev
```

### 5. Build for Production

```bash
npm run build
firebase deploy --only hosting
```

---

## 👥 User Roles

| Feature | Student | Faculty | Admin |
|---|---|---|---|
| View APPROVED MOAs | ✅ | ✅ | ✅ |
| View PROCESSING/EXPIRED MOAs | ❌ | ✅ | ✅ |
| See HTE ID, dates, industry, college | ❌ | ✅ | ✅ |
| See audit trail columns | ❌ | ❌ | ✅ |
| See deleted rows | ❌ | ❌ | ✅ |
| Add/Edit/Delete MOAs | ❌ | If granted | ✅ |
| Restore deleted MOAs | ❌ | ❌ | ✅ |
| Manage users & roles | ❌ | ❌ | ✅ |
| Grant faculty MOA access | ❌ | ❌ | ✅ |
| Block/unblock users | ❌ | ❌ | ✅ |
| View global audit trail | ❌ | ❌ | ✅ |

---

## 📋 MOA Status Categories

### ✅ APPROVED
- Signed by President
- On-going notarization
- No notarization needed

### ⏳ PROCESSING
- Awaiting signature of the MOA draft by HTE partner
- MOA draft sent to Legal Office for Review
- MOA draft and opinion of legal office sent to VPAA/OP for approval

### ⚠️ EXPIRING
- Two months before expiration

### ❌ EXPIRED
- No renewal done

---

## 🔒 Security Notes

- **No hard deletes**: All deletions are soft (isDeleted flag). Only admins can restore.
- **Firestore rules** enforce role-based access at the database level.
- **Domain restriction**: Only NEU institutional emails can sign in.
- **Blocked users**: Immediately signed out on next auth state check.
- **Audit trail**: All INSERT, UPDATE, DELETE, RESTORE operations are logged with user info, timestamp, and field-level changes.

---

## 🎨 Tech Stack

- **React 18** + **TypeScript**
- **TailwindCSS** — utility-first styling
- **Framer Motion** — animations & transitions
- **Firebase v10** — Auth, Firestore
- **react-hot-toast** — notifications
- **Vite** — build tool
- **lucide-react** — icons

---

## 📝 Customization Checklist

- [ ] Replace Firebase config in `src/lib/firebase.ts`
- [ ] Update role detection logic in `AuthContext.tsx` for your email patterns
- [ ] Add real COLLEGES list matching NEU's actual colleges
- [ ] Deploy Firestore security rules
- [ ] Create initial admin user manually in Firestore (set `role: 'admin'`)
- [ ] Add Firestore indexes for better query performance

## WEBSITE LINK 
[NEU MONITORING APP](neu-monitoring-app.vercel.app)
