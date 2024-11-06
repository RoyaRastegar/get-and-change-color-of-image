import { createStore, combineReducers } from "redux";
import colorReducer from "./featurs/changeColor/colorSlice";

const rootReducer = combineReducers({
  color: colorReducer,
});
const store = createStore(rootReducer);
export default store;
