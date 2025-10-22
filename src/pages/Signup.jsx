// src/pages/Signup.jsx (Whitespace Cleaned)
import React, { useState } from 'react';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../firebase/firebaseConfig';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

const Signup = () => {
const [error, setError] = useState(null);
const [loading, setLoading] = useState(false);
const navigate = useNavigate();

const handleSubmit = async (e) => {
e.preventDefault();
setLoading(true);
setError(null);

const displayName = e.target[0].value;
const email = e.target[1].value;
const password = e.target[2].value;

try {
const res = await createUserWithEmailAndPassword(auth, email, password);
const uid = res.user.uid;
      
      const defaultPhotoURL = `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=0D8ABC&color=fff`;

await updateProfile(res.user, {
displayName,
photoURL: defaultPhotoURL,
});

await setDoc(doc(db, 'users', uid), {
uid,
displayName,
email,
photoURL: defaultPhotoURL,
createdAt: serverTimestamp(),
isOnline: true,
});

toast.success("Account created successfully!");
setLoading(false);
navigate('/');

} catch (err) {
console.error("Signup error:", err);
setError(err.message);
setLoading(false);
}
};

return (
<div className="flex items-center justify-center min-h-screen bg-gray-100">
<div className="w-full max-w-md p-8 space-y-6 bg-white shadow-lg rounded-xl">
<h2 className="text-3xl font-bold text-center text-gray-900">Sign Up</h2>
<form onSubmit={handleSubmit} className="space-y-4">
<input
type="text"
placeholder="Display Name"
required
className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
/>
<input
type="email"
placeholder="Email"
required
className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
/>
<input
type="password"
placeholder="Password"
required
className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
/>

<button
type="submit"
disabled={loading}
className="w-full px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
>
{loading ? 'Processing...' : 'Register'}
</button>
{error && <p className="text-sm text-center text-red-500">{error}</p>}
</form>
<p className="text-sm text-center text-gray-600">
Already have an account? <Link to="/login" className="font-medium text-blue-600 hover:text-blue-500">Login</Link>
</p>
</div>
</div>
);
};

export default Signup;