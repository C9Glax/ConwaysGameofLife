import './App.css'
import Conway, {Cell} from './Conway';
import {type MouseEventHandler, useEffect, useState} from "react";

export default function App() {

  const [conway, setConway] = useState(new Conway());
  const [offsetX, setOffsetX] = useState(BigInt(0));
  const [offsetY, setOffsetY] = useState(BigInt(0));

  const getMappedCells = () : ClickableCell[][] => {
    const cells : ClickableCell[][] = [];

    const sizeX = Math.floor(window.innerWidth / 15) - 1;
    const sizeY = Math.floor((window.innerHeight - 42) / 15) - 1;

    for(let y = 0; y <= sizeY; y++) {
      const row  : ClickableCell[] = [];
      for(let x = 0; x <= sizeX; x++) {
        const c = new Cell(offsetX + BigInt(x), offsetY + BigInt(y));
        row.push(new ClickableCell(c, conway.IsCellAlive(c)));
      }
      cells.push(row);
    }
    return cells;
  }

  const [clickables, setClickables] = useState<ClickableCell[][]>(getMappedCells());

  const Next = () => {
    conway.Cycle();
    setClickables(getMappedCells());
  }

  useEffect(() => {
    setClickables(getMappedCells());
  }, [offsetX, offsetY, conway]);

  const [previousButtons, setPreviousButtons] = useState(0);
  const handleMouse : MouseEventHandler<HTMLDivElement> = (e) => {
    e.preventDefault();
    if(e.buttons & 1)
      handleLeftDrag(e);
    if(!(e.buttons & 1) && previousButtons & 1)
      handleLeftRelease(e);
    if(e.buttons & 4)
      handleMiddleDrag(e);
    if(!(e.buttons & 4) && previousButtons & 4)
      handleMiddleRelease(e);

    setPreviousButtons(e.buttons);
  }

  const cellsToSwitch = new Map<bigint, Cell>()
  const handleLeftDrag : MouseEventHandler<HTMLDivElement> = (e) => {
    const t = e.target as HTMLDivElement;
    const container = t.parentElement?.parentElement as HTMLDivElement;

    const x = BigInt(Math.floor((e.pageX - container.offsetLeft) / 15)) + offsetX;
    const y = BigInt(Math.floor((e.pageY - container.offsetTop)  / 15)) + offsetY;
    const c = new Cell(x, y);
    if(cellsToSwitch?.has(c.GetHash()))
      return;
    cellsToSwitch.set(c.GetHash(), c)
  }

  const handleLeftRelease : MouseEventHandler<HTMLDivElement> = (e) => {
    if(cellsToSwitch.size > 0){
      for (const cell of cellsToSwitch.values()) {
        conway.toggleCellAtCoordinate(cell.x, cell.y);
        setClickables(getMappedCells());
      }
      cellsToSwitch.clear();
    }
  }

  let offsetChangeX = 0;
  let offsetChangeY = 0;
  const handleMiddleDrag : MouseEventHandler<HTMLDivElement> = (e) => {
    offsetChangeX += e.movementX;
    offsetChangeY += e.movementY;
  }

  const handleMiddleRelease : MouseEventHandler<HTMLDivElement> = (e) => {
    setOffsetX(offsetX - BigInt(Math.floor(offsetChangeX / 15)));
    setOffsetY(offsetY - BigInt(Math.floor(offsetChangeY / 15)));

    offsetChangeX = 0;
    offsetChangeY = 0;
  }

  let row = 0;
  return (
      <>
        <div onMouseMove={handleMouse} onMouseUp={handleMouse} onMouseDown={handleMouse}>
          <div className={"rows"}>
            {clickables.map((x) => {
              let offset = row++ % 2;
              return <div key={x[0].cell.y} className={"row"}>
                {
                  x.map((cell: ClickableCell) => {
                    return <div key={cell.cell.GetHash()}
                                className={"clickableCell"}
                                // @ts-expect-error alive
                                alive={cell.alive ? "alive" : "dead"}
                                odd={offset++ % 2 === 0 ? "even" : "odd"}></div>
                  })}
              </div>
            })}
          </div>
        </div>
        <button onClick={() => Next()}>Step</button>
        <button onClick={() => setConway(new Conway())}>Reset</button>
        <span>{offsetX},{offsetY}</span>
      </>
  )
}

class ClickableCell {
  cell : Cell;
  alive: boolean;

  constructor(cell : Cell, alive: boolean) {
    this.cell = cell;
    this.alive = alive;
  }
}