import { Link } from "react-router-dom"

const SideBar = () => {
  return (
    // Left Section: Branding (Logo)
    <div className="flex-1 flex flex-col items-center justify-center bg-gray-800 text-white p-8 ">

      <Link
        to="/"
        className="text-4xl  md:text-5xl font-extrabold hover:scale-x-105  transform transition duration-300 tracking-wide">
        <span
          className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to to-blue-600">
          STUVENDOR
        </span>
      </Link>


      {/* <Link to="/" className="text-4xl md:text-5xl font-bold tracking-wide">
          STUVENDOR
        </Link> */}

      {/* <h4 className="p-6">Making products easily accessible...</h4> */}
    </div>
  )
}

export default SideBar
