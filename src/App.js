import React, { Component } from 'react';
import classnames from 'classnames';
import update from 'immutability-helper'

class App extends Component {
  constructor(props) {
    super(props)

    this.state = {
      circlePosition: [[Math.floor(Math.random() * 8), Math.floor(Math.random() * 8)]],
      bgColor: this.getRandomColor(),
      obstacles: [],
      counter: 0,
      options: {
        difficulty: 'Medium',
        trailSize: 7,
        numObstacles: 20
      },
      gameover: false
    }

    this.handleSquareClick = this.handleSquareClick.bind(this)
    this.getValidMoves = this.getValidMoves.bind(this)
    this.handleDifficultyChange = this.handleDifficultyChange.bind(this)
    this.reset = this.reset.bind(this)
  }

  componentDidMount() {
    let { circlePosition } = this.state
    let [circleX, circleY] = circlePosition[0]
    let newPosX = circleX
    let newPosY = circleY
    let _this = this

    window.onkeydown = function (e) {
      let code = e.keyCode ? e.keyCode : e.which;
      if (code === 38) { //up key
        newPosY = newPosY - 1
      } else if (code === 40) { //down key
        newPosY = newPosY + 1
      } else if (code === 39) { //right
        newPosX = newPosX + 1
      } else if (code === 37) { //left
        newPosX = newPosX - 1
      }

      _this.handleSquareClick(newPosX, newPosY)
    }
  }

  componentDidUpdate(prevProps, prevState) {
    const prevCounter = prevState.counter
    const thisCounter = this.state.counter
    thisCounter === prevCounter + 1 && this.createNewObstacle()
  }

  getRandomColor() {
    let letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
  }

  handleSquareClick(x, y) {
    const { obstacles, circlePosition, options } = this.state
    const [circleX, circleY] = circlePosition[0]
    const diagonals = [[circleX-1, circleY+1], [circleX+1, circleY+1], [circleX+1, circleY-1], [circleX-1, circleY-1]]

    let inValid = isArrayInArray(obstacles.slice(0, -1), [x,y]) || isArrayInArray(diagonals, [x,y]) || isArrayInArray(circlePosition, [x,y])

    if (circleX === x && circleY === y) {
      this.setState({
        bgColor: this.getRandomColor()
      })
    } else if(Math.abs(circleX - x) <= 1 && Math.abs(circleY - y) <= 1 && !inValid) {

      let newPosArray = update(this.state.circlePosition, {
        $unshift: [[x,y]]
      })

      this.setState({
        circlePosition: newPosArray.slice(0,options.trailSize),
        counter: this.state.counter + 1,
      })
    }
  }

  createNewObstacle() {
    const { obstacles, circlePosition, options } = this.state
    let newObstacle = [Math.floor(Math.random() * 8), Math.floor(Math.random() * 8)]
    let validObstacle = !isArrayInArray(obstacles, newObstacle) && !isArrayInArray(circlePosition, newObstacle)

    if(validObstacle) {
      let newObstacles = update(obstacles, {
        $unshift: [newObstacle]
      })
      this.setState({
        obstacles: newObstacles.slice(0, options.numObstacles)
      })
    } else {
      this.createNewObstacle()
    }
  }

  getValidMoves() {
    let { circlePosition, obstacles, gameover, options } = this.state
    let validMoves = []
    const [circleX, circleY] = circlePosition[0]
    const circlePos = circleX + (circleY * 8)

    let obstaclesArr = obstacles

    if (obstacles.length === parseInt(options.numObstacles)) {
      obstaclesArr = obstacles.slice(0, -1)
    }

      // Left
    circleX > 0 && !isArrayInArray(obstaclesArr, [circleX - 1, circleY]) && !isArrayInArray(circlePosition, [circleX - 1, circleY]) && validMoves.push(circlePos-1)
    // Right
    circleX < 7 && !isArrayInArray(obstaclesArr, [circleX + 1, circleY]) && !isArrayInArray(circlePosition, [circleX + 1, circleY]) && validMoves.push(circlePos+1)
    // Top
    circleY > 0 && !isArrayInArray(obstaclesArr, [circleX, circleY - 1]) && !isArrayInArray(circlePosition, [circleX, circleY - 1]) && validMoves.push(circlePos-8)
    // Bottom
    circleY < 7 && !isArrayInArray(obstaclesArr, [circleX, circleY + 1]) && !isArrayInArray(circlePosition, [circleX, circleY + 1])  && validMoves.push(circlePos+8)

    if (validMoves.length === 0 && !gameover) {
      this.setState({
        gameover: true
      })
    }

    return validMoves
  }

  renderSquare(i) {
    const { bgColor, circlePosition, options } = this.state
    const x = i % 8
    const y = Math.floor(i / 8)
    const black = (x + y) % 2 === 1

    const [circleX, circleY] = circlePosition[0]
    const circlePos = circleX + (circleY * 8)
    const validMoves = this.getValidMoves()
    const isValidMove = validMoves.indexOf(i) !== -1


    let circle = null;
    for (let j = 0; j < circlePosition.length && !circle; j++) {
      const [circleX, circleY] = circlePosition[j]
      const size = 1 - j / options.trailSize
      circle = (x === circleX && y === circleY) && <Circle bgColor={bgColor} size={size > 1 ? 1 : size} />
    }

    const {obstacles} = this.state
    let obstacle = null
    for (let k = 0; k < obstacles.length && !obstacle; k++) {
      const [obstacleX, obstacleY] = obstacles[k]
      obstacle = (x === obstacleX && y === obstacleY) && <Obstacle destroyNext={k === options.numObstacles - 1} />
    }

    return (
      <div key={i}
           style={{ width: '12.5%', height: '12.5%' }}
           onClick={() => this.handleSquareClick(x, y)}>
        <Square black={black} validMove={isValidMove} onClick={this.toggleClicked}>
          {circle}
          {obstacle}
        </Square>
      </div>
    )
  }

  handleDifficultyChange(e) {
    let level = e.target.value
    let newOptions
    switch (level) {
      case 'Easy':
        newOptions = {
          difficulty: level,
          numObstacles: 15,
          trailSize: 5
        }
        break
      case 'Medium':
        newOptions = {
          difficulty: level,
          numObstacles: 20,
          trailSize: 7
        }
        break
      case 'Hard':
        newOptions = {
          difficulty: level,
          numObstacles: 23,
          trailSize: 9
        }
        break
      case 'Insane':
        newOptions = {
          difficulty: level,
          numObstacles: 25,
          trailSize: 11
        }
        break
    }


    this.setState({
      options: update(this.state.options, {
        $set: newOptions
      })
    })
  }

  reset() {
    this.setState({
      circlePosition: [[Math.floor(Math.random() * 8), Math.floor(Math.random() * 8)]],
      bgColor: this.getRandomColor(),
      obstacles: [],
      counter: 0,
      gameover: false
    })
  }

  render() {
    const squares = [];
    for (let i = 0; i < 64; i++) {
      squares.push(this.renderSquare(i))
    }

    const obstacleOptions = []
    for (let i = 15; i <= 40; i++) {
      obstacleOptions.push(<option>{i}</option>);
    }

    const trailOptions = []
    for (let i = 2; i <= 10; i++) {
      trailOptions.push(<option>{i}</option>);
    }

    const { counter, gameover, options } = this.state

    return (
      <div className="App d-flex justify-content-center align-items-center flex-column">
        <div className="container">
          <div className="row">
            <div className="col-8">
              <div className="counter"><h3>Score: {counter}</h3></div>
              <div className={classnames("board", gameover && "gameover")}>
                {gameover && (
                <div className="gameover-text d-flex flex-column">
                  <h1>GAME OVER</h1>
                  <button onClick={this.reset}>Restart</button>
                </div>
                )}
                {squares}
              </div>
            </div>
              <div className="row">
                <div className="col-12">
                  <label>Difficulty</label>
                  <select onChange={this.handleDifficultyChange} defaultValue={options.difficulty} disabled={counter > 0}>
                    <option>Easy</option>
                    <option>Medium</option>
                    <option>Hard</option>
                    <option>Insane</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>
    )
  }
}

export default App;


const Square = (props) => {
  return (
    <div className={classnames("square", props.black && 'black', props.validMove && 'valid-move')}>{props.children}</div>
  )
}

const Circle = (props) => {
  return (
    <div className="circle" style={{ backgroundColor: props.bgColor, transform: 'scale(' + props.size + ')' }} />
  )
}

const Obstacle = (props) => {
  return (
    <div className={classnames("obstacle", props.destroyNext && 'destroy-next')} />
  )
}

function isArrayInArray(arr, item){
  let item_as_string = JSON.stringify(item)

  return arr.some(function (ele) {
    return JSON.stringify(ele) === item_as_string
  })
}
