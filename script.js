class Cell{
    constructor(x, y){
        //initialise variables in constructor
        this.x = x
        this.y = y
        this.visited = false;
        this.walls = {N: true, S: true, E: true, W: true}
        //recursive animation variables
        this.leader = false
        this.backtrack = false
        //Dijkstra animation variables
        this.searched = false
        this.inPath = false
    }

    draw(ctx, cellWidth, cellHeight){
        //x and y co-ordinates with cell size
        const x = this.x * cellWidth
        const y = this.y * cellHeight

        if(this.walls["N"]){
            //draw top wall
            ctx.moveTo(x, y)
            ctx.lineTo(x + cellWidth, y)
        }
        if(this.walls["S"]){
            //draw bottom wall
            ctx.moveTo(x, y+cellHeight)
            ctx.lineTo(x + cellWidth, y+cellHeight)
        }
        if(this.walls["E"]){
            //draw right wall
            ctx.moveTo(x+cellWidth, y)
            ctx.lineTo(x+cellWidth, y+cellHeight)
        }
        if(this.walls["W"]){
            //draw left wall
            ctx.moveTo(x, y+cellHeight)
            ctx.lineTo(x, y)
        }

        if(this.backtrack && !this.leader){
            ctx.fillStyle = "#52b456"
            ctx.fillRect(x, y, cellWidth, cellHeight)
        }
        if(this.leader){
            ctx.fillStyle = "red"
            ctx.fillRect(x, y, cellWidth, cellHeight)
        }

        if(this.searched){
            ctx.fillStyle = "#52b456"
            ctx.fillRect(x, y, cellWidth, cellHeight)
        }
        if(this.inPath){
            ctx.fillStyle = "purple"
            ctx.fillRect(x, y, cellWidth, cellHeight)
        }
    }

    removeWall(direction){
        //remove the wall in the given direction
        this.walls[direction] = false
    }

    carvePath(next){
        //calculate direction between the two cells
        const dx = next.x - this.x
        const dy = next.y - this.y

        //remove the walls depending on the direction
        if(dx === 1){
            this.removeWall("E")
            next.removeWall("W")
        }
        else if(dx === -1){
            this.removeWall("W")
            next.removeWall("E")
        }
        else if(dy === 1){
            this.removeWall("S")
            next.removeWall("N")
        }
        else if(dy === -1){
            this.removeWall("N")
            next.removeWall("S")
        }
    }
}

class Maze{
    constructor(rows, columns){
        //initialise variables in constructor
        this.rows = rows
        this.columns = columns
        this.grid = []
    }

    generateGrid(){
        //resets grid
        this.grid = []
        //iterates for the amount of rows
        for(let i = 0; i < this.rows; i++){
            //initialise a variable called row that starts as an empty array
            let row = []
            //iterates for the amount of columns
            for(let j = 0; j < this.columns; j++)
            {
                //add a cell to the row
                row.push(new Cell(j, i))
            }
            //add the row to the grid
            this.grid.push(row)
        }
    }

    async generateMaze(cell){
        cell.visited = true
        cell.leader = true

        this.displayGrid()

        let neighbours = this.getNeighbours(cell)

        while(neighbours.length > 0){
            //chooses a random direction
            const randDir = Math.floor(Math.random()*neighbours.length)
            //removes the chosen cell from the array
            const nextCell = neighbours.splice(randDir, 1)[0]

            //carves path and moves to the next cell
            cell.carvePath(nextCell)
            cell.backtrack = true
            nextCell.leader = true
            cell.leader = false
            this.displayGrid()
            await sleep(201 - speed.value)
            await this.generateMaze(nextCell)
            
            cell.backtrack = false
            nextCell.leader = false
            cell.leader = true
            this.displayGrid()
            await sleep(201 - speed.value)
            //gets the new neighbours
            neighbours = this.getNeighbours(cell)
        }
        this.displayGrid()
    }

    getNeighbours(cell){
        //list of all unvisited neighbours
        const neighbours = []

        //check north neighbour
        //check the cell is not in the top row and check the cell is not visited
        if(cell.y > 0 && !this.grid[cell.y-1][cell.x].visited){
            neighbours.push(this.grid[cell.y-1][cell.x])
        }
        //check south neighbour
        //check the cell is not in the bottom row and check the cell is not visited
        if(cell.y < this.rows-1 && !this.grid[cell.y+1][cell.x].visited){
            neighbours.push(this.grid[cell.y+1][cell.x])
        }
        //check east neighbour
        //check the cell is not in the right column and check the cell is not visited
        if(cell.x < this.columns-1 && !this.grid[cell.y][cell.x+1].visited){
            neighbours.push(this.grid[cell.y][cell.x+1])
        }
        //check west neighbour
        //check the cell is not in the left column and check the cell is not visited
        if(cell.x > 0 && !this.grid[cell.y][cell.x-1].visited){
            neighbours.push(this.grid[cell.y][cell.x-1])
        }

        return neighbours
    }

    displayGrid(){
        let c = document.getElementById("canvas")
        let ctx = c.getContext("2d")

        ctx.clearRect(0, 0, c.width, c.height)
        ctx.beginPath()
        
        //set the canvas size
        let cellWidth = (c.width/this.columns)
        let cellHeight = (c.height/this.rows)

        //set the colour and the line width
        ctx.strokeStyle = "black"
        ctx.lineWidth = 2

        //loops through rows
        for(let i = 0; i < this.rows; i++){
            //loops through columns
            for(let j = 0; j < this.columns; j++){
                this.grid[i][j].draw(ctx, cellWidth, cellHeight)
            }
        }
        ctx.stroke()
    }
}

class Pathfinding{
    constructor(grid){
        this.grid = grid
        
        this.rows = grid.length
        this.cols = grid[0].length

        //set the start at the top left
        this.start = grid[0][Math.floor(this.cols/2)]
        this.end = grid[this.rows-1][Math.floor(this.cols/2)]

        this.path = []
        this.visitedNodes = []
        this.solutionPath = []
    }

    getNeighbours(cell){
        const neighbours = []
        
        //gets the neighbour of the cells that do not have a wall (meaning there is an open path)
        //checks the bounds
        if(!cell.walls["N"] && cell.y > 0){
            neighbours.push(this.grid[cell.y-1][cell.x])
        }
        
        if(!cell.walls["S"] && cell.y < this.rows-1){
            neighbours.push(this.grid[cell.y+1][cell.x])
        }

        if(!cell.walls["E"] && cell.x < this.cols-1){
            neighbours.push(this.grid[cell.y][cell.x+1])
        }

        if(!cell.walls["W"] && cell.x > 0){
            neighbours.push(this.grid[cell.y][cell.x-1])
        }

        return neighbours
    }

    //gets the solution to the maze by starting at the end cell
    reconstructPath(previous){
        let current = this.end
        while(current){
            this.solutionPath.unshift(current)
            current = previous.get(current)
        }
    }
}

class DijkstraSolver extends Pathfinding{
    solve(){
        //priority queue
        const pq = []

        const distances = new Map()
        const previous = new Map()
        const visited = new Set()

        //sets the distance at the start to 0
        distances.set(this.start, 0)
        pq.push({cell: this.start, distance: 0})
        //while priority queue is not empty
        while (pq.length > 0){
            //sorts the queue in ascending order and then removes the smallest from the queue
            pq.sort((a, b) => a.distance - b.distance)
            const { cell: current, distance: currentDist } = pq.shift()
            if (visited.has(current)) continue;
            //adds the smallest value to the visited variable and to the list
            visited.add(current)
            this.visitedNodes.push(current)

            if (current === this.end) break;
            
            const neighbours = this.getNeighbours(current)
            //loops through the neighbours
            for (const neighbour of neighbours){
                if (visited.has(neighbour)) continue;
                //weighting of 1
                const newDist = currentDist + 1

                //checks the distance and overrides if needed
                if(!distances.has(neighbour) || newDist < distances.get(neighbour)){
                    distances.set(neighbour, newDist)
                    previous.set(neighbour, current)
                    pq.push({cell: neighbour, distance: newDist})
                }
            }
        }

        this.reconstructPath(previous)
        return this.solutionPath
    }
}

class AstarSolver extends Pathfinding{
    heuristic(cell){
        //calculates manhattan distance to use as a heuristic
        let manhattanDistance = Math.abs(cell.x - this.end.x) + Math.abs(cell.y - this.end.y)
        return manhattanDistance
    }

    solve(){
        const pq = []
        const g = new Map()
        const previous = new Map()
        const visited = new Set()

        g.set(this.start, 0)
        pq.push({cell: this.start, f: this.heuristic(this.start)})

        //while priority queue is not empty
        while (pq.length > 0){
            //sorts the queue in ascending order and then removes the smallest from the queue
            pq.sort((a, b) => a.f -b.f)
            const { cell: current } = pq.shift()
            if(visited.has(current)) continue
            visited.add(current)
            this.visitedNodes.push(current)
            if(current === this.end) break

            //loops through the neighbours
            for(const neighbour of this.getNeighbours(current)){
                if(visited.has(neighbour)) continue

                //weighting of 1
                const tentativeG = g.get(current) + 1
                if(!g.has(neighbour) || tentativeG < g.get(neighbour)){
                    //sets the g value and f value and adds to the priority queue
                    previous.set(neighbour, current)
                    g.set(neighbour, tentativeG)
                    const f = tentativeG + this.heuristic(neighbour)
                    pq.push({cell:neighbour, f: f})
                }
            }
        }

        this.reconstructPath(previous)
        return this.solutionPath
    }
}

let currentMaze = null
let speed = document.getElementById("speedSlider")
let skipTheAnimation = false
let paused = false
let generating = false
let solving = false

function retrieveInputs(){
    //get value from input fields
    rowData = document.getElementById("rows").value
    columnData = document.getElementById("columns").value

    //cast values to numbers
    rowData = Number(rowData)
    columnData = Number(columnData)

    //validate the data
    if ((Number.isInteger(rowData) && rowData >= 5 && rowData <= 100) && (Number.isInteger(columnData) && columnData >= 5 && columnData <= 100)) {
        document.getElementById("Error").textContent = ""
        return [rowData, columnData]
    }
    else {
        document.getElementById("Error").textContent = "Please enter valid data: data must be an integer, greater than 5 and less than 100"
        return
    }
}

function retrieveCheckBox(){
    dijkstraBox = document.getElementById("dijkstras").checked
    AstarBox = document.getElementById("A*").checked
    return [dijkstraBox, AstarBox]
}

async function createMaze(dimensions){
    retrieveCheckBox()
    if (dimensions != null){
        const myMaze = new Maze(dimensions[0], dimensions[1])
        myMaze.generateGrid()
        //start at top left
        await myMaze.generateMaze(myMaze.grid[0][0])
        return myMaze
    }
}

async function start(){
    if(generating && currentMaze == null){
        document.getElementById("Error").textContent = "Wait for generation to complete."
    }
    else{
        currentMaze = null
        generating = true
        paused = false
        skipTheAnimation = false
        currentMaze = await createMaze(retrieveInputs())
        currentMaze.grid[0][0].leader = false
        //makes the entrance and exit
        currentMaze.grid[0][Math.floor(currentMaze.columns/2)].walls["N"] = false
        currentMaze.grid[currentMaze.rows-1][Math.floor(currentMaze.columns/2)].walls["S"] = false
        currentMaze.displayGrid()
        generating = false
        document.getElementById("Error").textContent = ""
    }
}

async function solveMaze(){
    console.log(solving)
    if(generating){  
        document.getElementById("Error").textContent = "Wait for generation to complete."
    }
    else{
        if(solving){
            document.getElementById("Error").textContent = "Wait for solving to complete."
            return
        }
        solving = true
        paused = false
        skipTheAnimation = false
        let dijkstraNodes = document.getElementById("dijkstraNodes")
        let astarNodes = document.getElementById("astarNodes")
        //resets the searched variable for all cells
        //this is needed to reset the maze if the user wants to solve it multiple times or with the other algorithm
        for (let i = 0; i < currentMaze.rows; i++){
            for (let j = 0; j < currentMaze.columns; j++){
                currentMaze.grid[i][j].searched = false
                currentMaze.grid[i][j].inPath = false
            }
        }
        currentMaze.displayGrid()

        document.getElementById("Error").textContent = ""
        checkBoxBooleans = retrieveCheckBox()
        if(checkBoxBooleans[0] == true){
            //calculates the time taken to solve the maze using Dijkstra's
            solver = new DijkstraSolver(currentMaze.grid)
            const startTime = performance.now()
            solver.solve()
            const endTime = performance.now()
            const timeTaken = endTime - startTime
            document.getElementById("dijkstraTime").textContent = timeTaken.toFixed(3)
            dijkstraNodes.textContent = solver.visitedNodes.length
            await animateSolve(solver)
            solving = false
        }
        else if(checkBoxBooleans[1] == true){
            //calculates the time take to solve the maze using A*
            solver = new AstarSolver(currentMaze.grid)
            const startTime = performance.now()
            solver.solve()
            const endTime = performance.now()
            const timeTaken = endTime - startTime
            document.getElementById("astarTime").textContent = timeTaken.toFixed(3)
            astarNodes.textContent = solver.visitedNodes.length
            await animateSolve(solver)
            solving = false
        }
    }
    
}

async function animateSolve(solver){
    for (let cell of solver.visitedNodes){
        //sets the searched variable to true for the cells that were visited
        cell.searched = true
        currentMaze.displayGrid()
        await sleep(201 - speed.value)
    }

    for (let cell of solver.solutionPath){
        //sets the inPath variable to true for the cells in the solution path
        cell.inPath = true
        currentMaze.displayGrid()
        await sleep(201 - speed.value)
    }
}

function initialiseCanvas(){
    //initialise canvas
    const canvas = document.getElementById("canvas")
    const ctx = canvas.getContext("2d")
    canvas.width = 640
    canvas.height = 640
    ctx.strokeStyle = "black"
    ctx.strokeRect(0, 0, canvas.width, canvas.height)
}

function reset(){
    generating = false
    solving = false
    console.log("reset")
    currentMaze = null
    //resets text content of the table
    document.getElementById("dijkstraTime").textContent = "---"
    document.getElementById("astarTime").textContent = "---"
    document.getElementById("dijkstraNodes").textContent = "---"
    document.getElementById("astarNodes").textContent = "---"
    initialiseCanvas()
}

function skipAnimation(){
    console.log("skip")
    skipTheAnimation = true
}

function pauseAnimation(){
    paused = !paused
    if (paused){
        document.getElementById("pause").textContent = "Resume"
    }
    else{
        document.getElementById("pause").textContent = "Pause"
    }
}

async function sleep(ms) {
    if(skipTheAnimation){
        return
    }

    while (paused){
        await new Promise(resolve => setTimeout(resolve, 50));
    }
    return new Promise(resolve => setTimeout(resolve, ms));
}

//calls the initialiseCanvas function when the window loads
window.onload = initialiseCanvas
