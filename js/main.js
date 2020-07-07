var CELL_WIDTH = 5;
var COLS_COUNT = 40;
var ROWS_COUNT = 40;
var CURRENT_SELECTED_MODE = -1;
var path_found = false;
var counter = 0;
var mat;
var cells_queue = []
var min_dist = 1;
var OBSTACLES_RANDOM_BUILD_COUNT = 150;
const dx = [1,0,-1,0];
const dy = [0,1,0,-1];
var CURRENT_START_POINT = [null,null];
var CURRENT_START_CELL = null;
var CURRENT_END_POINT = [null,null];
var CURRENT_END_CELL = null;
var OBSTACLES = [];
var CELL_FILL_DELAY = 100;
var fill_info_update_interval;
var filled_cells_count = 0;
var simulation_started = false;

function modifySimulationSpeed(milliseconds)
{
	CELL_FILL_DELAY = milliseconds;
}


function toggleMode(mode)
{
	CURRENT_SELECTED_MODE = mode;
}

function createGrid(rows,cols)
{
	for(var i=0;i<rows;i++)
	{
		for(var j=0;j<cols;j++)
		{
			var cell_row = []
			var cell = createCell();
			//cell.innerHTML = `(${i+1},${j+1})`;
			var row_number = document.createAttribute('line');
			row_number.value = i+1
			var col_number = document.createAttribute('column');
			col_number.value = j+1
			cell.setAttributeNode(row_number);
			cell.setAttributeNode(col_number);
			cell.addEventListener("click", (e) => {
				handleCellClick(e.target);
			})
			document.getElementById('grid-area').appendChild(cell);
		}
	}
}


function generatePathTrace()
{
	console.log("Generating path trace");
	var path_trace = []
	var current_point_i = CURRENT_END_POINT[0];
	var current_point_j = CURRENT_END_POINT[1];
	var current_path_length_value = mat[current_point_i][current_point_j];
	path_trace.push([current_point_i,current_point_j]);

	while(!(current_point_i==CURRENT_START_POINT[0] && current_point_j == CURRENT_START_POINT[1]))
	{
			for(var k=0;k<4;k++)
			{
				if(isInside(current_point_i+dy[k],current_point_j+dx[k]))
				{
					if(mat[current_point_i+dy[k]][current_point_j+dx[k]] == current_path_length_value-1)
					{
						current_path_length_value -= 1;
						current_point_i += dy[k];
						current_point_j += dx[k];
						path_trace.push([current_point_i,current_point_j]);
					}
				}
			}
	}
	drawPathTrace(path_trace);
}


function setCellAsPathComponent(cell) 
{
	cell.classList.add("path_cell");
}

function drawPathTrace(path_trace)
{
	var path_len = path_trace.length;
	for(var path_cell_index = path_len-2; path_cell_index>0;path_cell_index--)
	{
		var i = path_trace[path_cell_index][0];
		var j = path_trace[path_cell_index][1];
		var cell = getGridCellUsingIndices(i,j);
		setTimeout(setCellAsPathComponent,(path_len-path_cell_index)*50,cell);
	}
}

function updateFilledAreaInfo()
{
	console.log("Updating filled area info");
	if(filled_cells_count >= document.querySelectorAll(".visited_cell").length)
	{
		if(path_found == true)
			generatePathTrace();
		clearInterval(fill_info_update_interval);
	}
	else
	{
		filled_cells_count = document.querySelectorAll(".visited_cell").length;
		document.getElementById('filled-area-value').innerHTML = Math.round((filled_cells_count/(ROWS_COUNT*COLS_COUNT))*100)
	}
}

function handleCellClick(cell) {
	if(CURRENT_SELECTED_MODE == 0)
	{
		changeStartPoint(cell);
	}
	else if(CURRENT_SELECTED_MODE == 1)
	{
		changeEndPoint(cell);
	}
	else if(CURRENT_SELECTED_MODE == 2)
	{
		addObstacle(cell);
	}
}

function changeStartPoint(cell)
{
		if(CURRENT_START_CELL != null) CURRENT_START_CELL.classList.remove("start_point");
		cell.classList.add("start_point");
		CURRENT_START_CELL = cell;
		CURRENT_START_POINT = [parseInt(cell.getAttribute('line')),parseInt(cell.getAttribute('column'))];
		//console.log(`Modified current start point to ${CURRENT_START_POINT}`);
}

function changeEndPoint(cell)
{
		//console.log(CURRENT_END_POINT);
		if(CURRENT_END_CELL != null) CURRENT_END_CELL.classList.remove("end_point");
		cell.classList.add("end_point");
		CURRENT_END_CELL = cell;
		CURRENT_END_POINT = [parseInt(cell.getAttribute('line')),parseInt(cell.getAttribute('column'))];
}

function addObstacle(cell) 
{
		if(cell == CURRENT_START_CELL || cell == CURRENT_END_CELL) return;
		cell.classList.add("obstacle");
		OBSTACLES.push([parseInt(cell.getAttribute('line')),parseInt(cell.getAttribute('column'))]);
}

function getRandomPosition()
{
	return Math.ceil(Math.random()*(ROWS_COUNT-1));
}

function generateRandomConfiguration()
{
	/**
	var start_x = getRandomPosition();
	var start_y = getRandomPosition();
	changeStartPoint(getGridCellUsingIndices(start_x,start_y));
	var end_x = getRandomPosition();
	var end_y = getRandomPosition();
	changeEndPoint(getGridCellUsingIndices(end_x,end_y));
	**/
	for(var i=0;i<OBSTACLES_RANDOM_BUILD_COUNT;i++)
	{
		var obstacle_x = getRandomPosition();
	    var obstacle_y = getRandomPosition();
	    addObstacle(getGridCellUsingIndices(obstacle_x,obstacle_y));
	}
}

function createCell(props)
{
	let cell = document.createElement("div");
	cell.classList.add("grid-cell");
	return cell;
}

function getGridCellUsingIndices(i,j)
{
	return document.getElementsByClassName('grid-cell')[(i-1)*COLS_COUNT+j-1];
}

function highlightVisitedCell(i,j)
{
	var high_cell = getGridCellUsingIndices(i,j);
	high_cell.classList.add('visited_cell');
}

function isInside(i,j)
{
	return (i>0&&i<=ROWS_COUNT) && (j>0&&j<=COLS_COUNT);
}

function fillPath()
{
	fill_info_update_interval = setInterval(updateFilledAreaInfo,CELL_FILL_DELAY*2.5);
	while(cells_queue.length > 0)
	{
		let i = cells_queue[0][0];
		let j = cells_queue[0][1];

		if(i == CURRENT_END_POINT[0] && j == CURRENT_END_POINT[1]) 
		{
			path_found=true;
			console.log("AICI");
		}
		else
		{
			for(var k=0;k<4;k++)
			{
				if(i+dy[k] == CURRENT_END_POINT[0] && j+dx[k] == CURRENT_END_POINT[1]) 
				{
					mat[i+dy[k]][j+dx[k]]  = mat[i][j]+1;
					console.log("AICI");
					path_found = true;
				}
			}
			for(var k=0;k<4;k++)
			{
				if(isInside(i+dy[k],j+dx[k]) && path_found==false)
				{
					if(mat[i+dy[k]][j+dx[k]] == 0)
					{
						//console.log(`Adding ${[i+dy[k],j+dx[k]]} in queue`);
						cells_queue.push([i+dy[k],j+dx[k]]);
						mat[i+dy[k]][j+dx[k]] = mat[i][j]+1;
						if(!(i+dy[k] == CURRENT_END_POINT[0] && j+dx[k] == CURRENT_END_POINT[1]))
						setTimeout(highlightVisitedCell,mat[i+dy[k]][j+dx[k]]*CELL_FILL_DELAY,i+dy[k],j+dx[k]);

					}
				}
			}
		}
		cells_queue = cells_queue.splice(1);
	}
	//if(path_found)
	//clearInterval(fill_info_update_interval);
}

function simulatePathFinding()
{

	if(simulation_started == true) {
		console.log("Simulation pending or restart required");
		return;
	}
	simulation_started = true;
	mat = new Array(ROWS_COUNT+1);
	for(var i=0;i<=ROWS_COUNT;i++)
	{
		mat[i] = new Array(COLS_COUNT+1);
	}
	for(var i=0;i<=ROWS_COUNT;i++)
	{
		for(var j=0;j<=COLS_COUNT;j++)
		mat[i][j] = 0;
	}
	for(var i=0;i<OBSTACLES.length;i++)
	{
		mat[OBSTACLES[i][0]][OBSTACLES[i][1]] = -1;
	}
	//console.log(`Starting from ${CURRENT_START_POINT[0]} ${CURRENT_START_POINT[1]}`);
	mat[CURRENT_START_POINT[0]][CURRENT_START_POINT[1]] = 1;
	cells_queue.push(CURRENT_START_POINT);
	fillPath();
}
window.onload = function () {
	var grid = createGrid(ROWS_COUNT,COLS_COUNT);
	document.getElementById('grid-area').classList.remove('minimized');
}