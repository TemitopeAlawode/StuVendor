import { Link } from "react-router-dom"

const Footer = () => {
  return (
   <footer className="bg-gray-800 text-white mt-auto py-6">

    <div className="container px-4 mx-auto flex flex-col md:flex-row justify-between items-center">

      {/* Branding and Description */}
      <div className="mb-4 md:mb-0 text-center md:text-left">
       <Link to='/'> <h3 className="text-xl font-bold">StuVendor</h3> </Link>
        <p className="text-sm text-gray-400 mt-2">Connecting students with local vendors for all their domestic needs.</p>
      </div>

      {/* Navigation Links */}
      <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-6 mb-4 md:mb-0 text-center text-sm">
        <Link to="/" className="hover:text-gray-400 transition-colors">Home</Link>
        <Link to="/products" className="hover:text-gray-400 transition-colors">Products</Link>
        <Link to="/auth/signup" className="hover:text-gray-400 transition-colors">Signup</Link>
        <Link to="/auth/login" className="hover:text-gray-400 transition-colors">Login</Link>
      </div>

{/* Contact Information */}
        <div className="text-center md:text-right">
          <p className="text-sm text-gray-400">Email: stuvendor.noreply@gmail.com</p>
          <p className="text-sm text-gray-400">Phone: +234 704 078 9324</p>
        </div>
        
    </div>

<div className="mt-4 text-center text-xs text-gray-500">
        <p>&copy; {new Date().getFullYear()} StuVendor. All rights reserved.</p>
      </div>
   </footer>
  )
}

export default Footer
