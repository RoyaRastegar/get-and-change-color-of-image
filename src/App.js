import ColorChange from "./components/ColorChange";
import { Provider } from "react-redux";
import store from "./store";
function App() {
  return (
    <Provider store={store}>
      <ColorChange />
    </Provider>
  );
}

export default App;
