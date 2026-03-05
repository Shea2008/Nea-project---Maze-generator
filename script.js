class Cell{
    constructor(x, y){
        //initialise variables in constructor
        this.x = x
        this.y = y
        this.cellSize = 32
        this.visited = false;
        this.walls = {N: true, S: true, E: true, W: true}
        //recursive animation variables
        this.leader = false
        this.backtrack = false
        //Dijkstra animation variables
        this.searched = false
        this.inPath = false
    }

    draw(ctx){
        //x and y co-ordinates with cell size
        const x = this.x * this.cellSize
        const y = this.y * this.cellSize

        if(this.walls["N"]){
            //draw top wall
            ctx.moveTo(x, y)
            ctx.lineTo(x + this.cellSize, y)
        }
        if(this.walls["S"]){
            //draw bottom wall
            ctx.moveTo(x+this.cellSize, y+this.cellSize)
            ctx.lineTo(x, y+this.cellSize)
        }
        if(this.walls["E"]){
            //draw right wall
            ctx.moveTo(x+this.cellSize, y)
            ctx.lineTo(x+this.cellSize, y+this.cellSize)
        }
        if(this.walls["W"]){
            //draw left wall
            ctx.moveTo(x, y+this.cellSize)
            ctx.lineTo(x, y)
        }

        if(this.backtrack && !this.leader){
            ctx.fillStyle = "green"
            ctx.fillRect(x, y, this.cellSize, this.cellSize)
        }
        if(this.leader){
            ctx.fillStyle = "red"
            ctx.fillRect(x, y, this.cellSize, this.cellSize)
        }

        if(this.searched){
            ctx.fillStyle = "dodgerblue"
            ctx.fillRect(x, y, this.cellSize, this.cellSize)
        }
        if(this.inPath){
            ctx.fillStyle = "yellow"
            ctx.fillRect(x, y, this.cellSize, this.cellSize)
        }
        //draw the lines
        ctx.stroke()
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
            await sleep(200)
            await this.generateMaze(nextCell)
            
            cell.backtrack = false
            nextCell.leader = false
            cell.leader = true
            this.displayGrid(this.grid)
            await sleep(200)
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
        
        //set the canvas size
        c.width = 32*this.columns
        c.height = 32*this.rows

        //set the colour and the line width
        ctx.strokeStyle = "black"
        ctx.lineWidth = 2

        //loops through rows
        for(let i = 0; i < this.rows; i++){
            //loops through columns
            for(let j = 0; j < this.columns; j++){
                this.grid[i][j].draw(ctx)
            }
        }
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

            //if (current === this.end) break;
            
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
        //calculates manhattan distanceto use as a heuristic
        return (cell.x - this.end.x) + (cell.y - this.end.y)
    }

    solve(){
        const pq = []
        const g = new Map()
        const previous = new Map()
        const visited = new Set()

        g.set(this.start, 0)
        pq.push({cell: this.start, f: this.heuristic(this.start)})

        while (pq.length > 0){
            pq.sort((a, b) => a.f -b.f)
            const { cell: current } = pq.shift()
            if(visited.has(current)) continue
            visited.add(current)
            this.visitedNodes.push(current)
            if(current === this.end) break

            for(const neighbour of this.getNeighbours(current)){
                if(visited.has(neighbour)) continue

                const tentativeG = g.get(current) + 1
                if(!g.has(neighbour) || tentativeG < g.get(neighbour)){
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

function retrieveInputs(){
    //get value from input fields
    rowData = document.getElementById("rows").value
    columnData = document.getElementById("columns").value

    //cast values to numbers
    rowData = Number(rowData)
    columnData = Number(columnData)

    //validate the data
    if ((Number.isInteger(rowData) && rowData >= 5 && rowData <= 40) && (Number.isInteger(columnData) && columnData >= 5 && columnData <= 40)) {
        document.getElementById("Error").textContent = ""
        return [rowData, columnData]
    }
    else {
        document.getElementById("Error").textContent = "Please enter valid data: data must be an integer, greater than 5 and less than 40"
        return null
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
    currentMaze = await createMaze(retrieveInputs())
    currentMaze.grid[0][0].leader = false
    currentMaze.grid[0][Math.floor(currentMaze.columns/2)].walls["N"] = false
    currentMaze.grid[currentMaze.rows-1][Math.floor(currentMaze.columns/2)].walls["S"] = false
    currentMaze.displayGrid()
}

function solveMaze(){
    if(!currentMaze){  
        document.getElementById("Error").textContent = "Wait for generation to complete."
    }
    else{
        document.getElementById("Error").textContent = ""
        checkBoxBooleans = retrieveCheckBox()
        if(checkBoxBooleans[0] == true){
            console.log("dijkstra")
            solver = new DijkstraSolver(currentMaze.grid)
            console.log(solver.solve())
            animateDijkstra(solver)
        }
        else if(checkBoxBooleans[1] == true){
            console.log("a star")
            solver = new AstarSolver(currentMaze.grid)
            console.log(solver.solve())
            animateDijkstra(solver)
        }
    }
    
}

async function animateDijkstra(solver){
        for (let cell of solver.visitedNodes){
            cell.searched = true
            currentMaze.displayGrid()
            await sleep(100)
        }

        for (let cell of solver.solutionPath){
            cell.inPath = true
            currentMaze.displayGrid()
            await sleep(100)
        }
    }

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
