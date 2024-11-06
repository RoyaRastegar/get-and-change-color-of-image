// States
const initialState = {
  color: "#561ecb",

  colorMap: {},
};

//   reducer
export default function colorReducer(state = initialState, action) {
  switch (action.type) {
    case "SetColor":
      return {
        ...state,
        color: action.payload,
      };
    case "UpdateColorMap":
      return { ...state, colorMap: action.payload };
    default:
      return state;
  }
}

// Actions

export function setColor(color) {
  return { type: "SetColor", payload: color };
}

export function updateColorMap(colorMap) {
  return { type: "UpdateColorMap", payload: colorMap };
}
