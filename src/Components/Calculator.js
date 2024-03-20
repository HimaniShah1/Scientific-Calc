import { useReducer, useState } from "react";
import calculator_buttons from "./buttonsData";

const Calculator = () => {

  const [result, setResult] = useState('0');
  const [radian, setRadian] = useState(true);

  const initialState = {
    operation: [],
    formula: [],
  };

  const OPERATORS = ['+', '-', '*', '/'];
  const POWER = 'POWER(';
  let ans;

  const trigo = (callback, angle) => {
    if (!radian) {
        angle = angle * Math.PI / 180;
      }
      return callback(angle);   
  };
 
  const inv_trigo = (callback, value) => {
    let angle = callback(value);

    if (!radian) {
      angle = angle * 180 / Math.PI;
    }
    return angle;
  };

  const fact = (number) => {
    if (number === 0 || number === 1) return 1;

    let result = 1;
    for (let i = 1; i <= number; i++) {
      result *= i;
      if (result === Infinity) return Infinity;
    }
    return result;
  };

    const search = (array, keyword) => {
    let search_result = [];

    array.forEach((element, index) => {
      if (element === keyword) search_result.push(index);
    });

    return search_result;
  };

  const powerBaseGetter = (formula, POWER_SEARCH_RESULT) => {
    let power_bases = [];

    POWER_SEARCH_RESULT.forEach((power_index) => {
      let base = []; 

      let parenthesis_count = 0;
      let previous_index = power_index - 1;

      while (previous_index >= 0) {
        if (formula[previous_index] === '(') parenthesis_count--;
        if (formula[previous_index] === ')') parenthesis_count++;

        let is_operator = false;
        OPERATORS.forEach((OPERATOR) => {
          if (formula[previous_index] === OPERATOR) is_operator = true;
        });

        let is_power = formula[previous_index] === POWER;

        if ((is_operator && parenthesis_count === 0) || is_power) break;

        base.unshift(formula[previous_index]);
        previous_index--;
      }

      power_bases.push(base.join(''));
    });

    return power_bases;
  };


  const reducer = (state, action) => {
    switch (action.type){
      case 'OPERATION':
        console.log('Formula array:', [...state.formula, action.payload.formula]);
        console.log('Operation array:', [...state.operation, action.payload.symbol]); 
        return {
          ...state,
          operation: [...state.operation, action.payload.symbol],
          formula: [...state.formula, action.payload.formula]
        }

      case 'NUMBER':
        console.log('Formula array:', [...state.formula, action.payload.formula]);
        console.log('Operation array:', [...state.operation, action.payload.symbol]);
        return {
          ...state,
          operation: [...state.operation, action.payload.symbol],
          formula: [...state.formula, action.payload.formula]
        }

      case 'TRIGO_FUNCTION':
      console.log('Formula array:', [...state.formula, action.payload.formula]);
      console.log('Operation array:', [...state.operation, action.payload.symbol]);
        return{
          ...state,
          operation: [...state.operation, action.payload.symbol +'('],
          formula: [...state.formula, action.payload.formula],     
        }

      case 'MATH_FUNCTION':
        console.log('Formula array:', [...state.formula, action.payload.formula]);
        console.log('Operation array:', [...state.operation, action.payload.symbol]);
        let symbol, formula;
        if (action.payload.name === 'factorial') {
          symbol = 'fact(';
          formula = action.payload.formula;  
        } else if (action.payload.name === 'power') {
          symbol = '^(';
          formula = action.payload.formula;
        } else if (action.payload.name === 'square') {
          symbol = '^(2)';
          formula = action.payload.formula;
        } else {
          symbol = action.payload.symbol + '(';
          formula = action.payload.formula + '(';
        }
        return {
          ...state,
          operation: [...state.operation, symbol],
          formula: [...state.formula, formula],
        };

      case 'KEY':
        if (action.payload.name === 'clear') {
          setResult('0');
          return initialState;
        } else if (action.payload.name === 'delete') {
          return {
            ...state,
            operation: state.operation.slice(0, -1),
            formula: state.formula.slice(0, -1),
          };
        }

      case 'CALCULATE':
        let formulaStr = state.formula.join('');
        let result;

        try {
          //factorial
          if (formulaStr.includes('fact(')) {
            const formulaParts = formulaStr.split('fact(');
            formulaStr = formulaParts.map((part, index) => {
              if (index < formulaParts.length - 1) {
                return `${part}fact(`;
              }
              return part;
            }).join('');

            // result = eval(formulaStr); 
            // console.log(result);
          }
          //power
          if (formulaStr.includes('POWER(')) {
            let powerSearchResult = search(state.formula, POWER);
            const bases = powerBaseGetter(state.formula, powerSearchResult);
            bases.forEach((base) => {
              let toReplace = base + POWER;
              let replacement = 'Math.pow(' + base + ',';
              formulaStr = formulaStr.replace(toReplace, replacement);
          });
        
            // result = eval(formulaStr);
            // console.log(result);
            
          } 
          
          result = eval(formulaStr);
          console.log(result);
          
        } catch (error) {
          console.log(error);
          if (error instanceof SyntaxError) {
            result = 'Syntax Error!';
          }
        }
        
        setResult(result);
        
       
      default:
        return state;
    }
  };

  const [state, dispatch] = useReducer(reducer, initialState);

  //Input the buttons and display it in ui
  const createCalculatorButtons = (dispatch, radian, setRadian) => {
    const btns_per_row = 8;
    let added_btns = 0;
    const rows = [];

    calculator_buttons.forEach((button, index) => {
      if(added_btns % btns_per_row === 0){
        rows.push([]);
      }

      rows[rows.length - 1].push(
        <button 
           key={index} 
           id={button.name} 
           onClick={() => {
            if (button.name === 'rad' && !radian) {
              setRadian(true);
            } else if (button.name === 'deg' && radian) {
              setRadian(false);
            } else {
              calculator(button);
            }
          }}
          className={button.name === 'rad' || button.name === 'deg' ? (button.name === 'rad' ? (radian ? 'active-angle' : '') : (!radian ? 'active-angle' : '')) : ''}
        >
          {button.symbol}
        </button>
      );
      added_btns++;
    });

    return rows.map((row,index) => (
      <div key={index} className="row">
        {row}
      </div>
    ));
  }

  //handle onClick for buttons
  const calculator = (button) => {
    if (button.type === 'operator') {
      dispatch({ type: 'OPERATION', payload: button });
    } else if (button.type === 'number') {
      dispatch({ type: 'NUMBER', payload: button });
    } else if (button.type === 'trigo_function') {
      dispatch({ type: 'TRIGO_FUNCTION', payload: button });
    } else if (button.type === 'math_function') {
      if (button.name === 'factorial') {
        dispatch({ type: 'MATH_FUNCTION', payload: { ...button, symbol: 'fact(', formula: 'fact(' } });
      } else if (button.name === 'power') {
        dispatch({ type: 'MATH_FUNCTION', payload: button });
      } else {
        dispatch({ type: 'MATH_FUNCTION', payload: button });
      }
    } else if (button.type === 'key') {
      if (button.name === 'clear') {
        dispatch({ type: 'KEY', payload: button });
      } else if (button.name === 'delete') {
        dispatch({ type: 'KEY', payload: button });
      }
    } else if (button.type === 'calculate') {
      dispatch({ type: 'CALCULATE' });
    }
  };

  return(
    <div className="calculator">
      <div className="calc-container">
        <div className="output">
          <div className="operation">
            <div className="value">{state.operation}</div>  
          </div>
          <div className="result">
            <div className="value">{result}</div>
          </div>
        </div>

        <div className="input">
          {createCalculatorButtons(dispatch, radian, setRadian)}
        </div>

      </div>
    </div>
    
  )

};

export default Calculator;
