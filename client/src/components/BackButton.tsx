import { useNavigate } from "react-router-dom"

const BackButton = () => {

    const navigate = useNavigate();

  return (
    <>
       <button
            className="bg-gray-300 font-medium text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-400 transition-colors cursor-pointer"
            // onClick={handleBack}
            onClick={() => { navigate(-1) }}
          >
            &larr; Back
          </button>
    </>
  )
}

export default BackButton
