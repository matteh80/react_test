import React, { Component } from 'react';
import './App.css';
import classnames from 'classnames';
import update from 'immutability-helper'

class App extends Component {
  constructor(props) {
    super(props)

    this.state = {
      circlePosition: [1,1],
      bgColor: this.getRandomColor(),
      obstacles: [],
      counter: 0
    }

    this.handleSquareClick = this.handleSquareClick.bind(this)
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
    const { obstacles } = this.state
    const [circleX, circleY] = this.state.circlePosition

    let inValid = isArrayInArray(obstacles, [x,y])

    if (circleX === x && circleY === y) {
      this.setState({
        bgColor: this.getRandomColor()
      })
    } else if(Math.abs(circleX - x) <= 1 && Math.abs(circleY - y) <= 1 && !inValid) {
      this.setState({
        circlePosition: [x,y],
        counter: this.state.counter + 1,
      })
    }
  }

  createNewObstacle() {
    const { obstacles, circlePosition } = this.state
    let newObstacle = [Math.floor(Math.random() * 8), Math.floor(Math.random() * 8)]
    let validObstacle = !isArrayInArray(obstacles, newObstacle) && circlePosition.indexOf(newObstacle) === -1

    if(validObstacle) {
      const newObstacles = update(obstacles, {
        $push: [newObstacle]
      })
      this.setState({
        obstacles: newObstacles
      })
    } else {
      this.createNewObstacle()
    }
  }

  renderSquare(i) {
    const { bgColor } = this.state
    const [circleX, circleY] = this.state.circlePosition
    const x = i % 8
    const y = Math.floor(i / 8)
    const black = (x + y) % 2 === 1

    const circle = (x === circleX && y === circleY) ? <Circle bgColor={bgColor} /> : null

    const {obstacles} = this.state
    let obstacle = null
    for (let i = 0; i < obstacles.length && !obstacle; i++) {
      const [obstacleX, obstacleY] = obstacles[i]
      obstacle = (x === obstacleX && y === obstacleY) && <Obstacle />
    }

    return (
      <div key={i}
           style={{ width: '12.5%', height: '12.5%' }}
           onClick={() => this.handleSquareClick(x, y)}>
        <Square black={black} onClick={this.toggleClicked}>
          {circle}
          {obstacle}
        </Square>
      </div>
    )
  }

  render() {
    const squares = [];
    for (let i = 0; i < 64; i++) {
      squares.push(this.renderSquare(i))
    }

    const { counter } = this.state

    return (
      <div className="App d-flex justify-content-center align-items-center flex-column">
        <div className="counter"><h3>{counter}</h3></div>
        <div className="board">
            {squares}
        </div>
      </div>
    )
  }
}

export default App;


const Square = (props) => {
  return (
    <div className={classnames("square", props.black && 'black')}>{props.children}</div>
  )
}

const Circle = (props) => {
  return (
    <div className="circle" style={{ backgroundColor: props.bgColor }} />
  )
}

const Obstacle = (props) => {
  return (
    <div className="obstacle" />
  )
}

function isArrayInArray(arr, item){
  let item_as_string = JSON.stringify(item)

  return arr.some(function (ele) {
    return JSON.stringify(ele) === item_as_string
  })
}
