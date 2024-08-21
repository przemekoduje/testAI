import Associations from "./routers/associations";
import CameraCapture from "./routers/cameraCapture/CameraCapture";
import ImageToText from "./routers/ImageToText";
import {
  createBrowserRouter,
  RouterProvider,
  
  Link,
} from "react-router-dom";

// Komponent Home
function Home() {
  return (
    <div>
      <h1>Test AI</h1>
      <nav>
        <ul>
          <li>
            <Link to="/assoc">Associations</Link>
          </li>
          <li>
            <Link to="/imagetotext">Image to Text</Link>
          </li>
          <li>
            <Link to="/camera">Camera Capture</Link>
          </li>
        </ul>
      </nav>
    </div>
  );
}

// Definicja routera
const router = createBrowserRouter([
  {
    path: "/",
    element: <Home />,
  },
  {
    path: "/assoc",
    element: <Associations />,
  },
  {
    path: "/imagetotext",
    element: <ImageToText />,
  },
  {
    path: "/camera",
    element: <CameraCapture />,
  },
]);



function App() {

  return (
    <div className="App">
      <RouterProvider router={router} />
    </div>
  );
}

export default App;
