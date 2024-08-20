import Associations from "./routers/associations";
import ImageToText from "./routers/ImageToText";
import {
  createBrowserRouter,
  RouterProvider,
  Route,
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
]);



function App() {

  return (
    <div className="App">
      <RouterProvider router={router} />
    </div>
  );
}

export default App;
