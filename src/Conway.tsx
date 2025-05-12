export default class Conway {
    aliveCells : Map<bigint, Cell> = new Map<bigint, Cell>();

    Cycle(){
        const newAliveCells : Map<bigint, Cell> = new Map<bigint, Cell>();
        this.aliveCells.forEach((cell : Cell) => {
            for(let checkX = cell.x - BigInt(1); checkX <= cell.x + BigInt(1); checkX++) {
                for(let checkY = cell.y - BigInt(1); checkY <= cell.y + BigInt(1); checkY++ ) {
                    if(this.NextCycleAlive(checkX, checkY)){
                        const c = new Cell(checkX, checkY)
                        newAliveCells.set(c.GetHash(), c);
                    }
                }
            }
        });
        this.aliveCells = newAliveCells;
    }

    IsCellAlive(cell : Cell) : boolean{
        return this.aliveCells.has(cell.GetHash());
    }

    private NextCycleAlive(x : bigint, y : bigint) : boolean {
        let aliveAround = 0;
        for(let checkX = x - BigInt(1); checkX <= x + BigInt(1); checkX++) {
            for(let checkY = y - BigInt(1); checkY <= y + BigInt(1); checkY++ ) {
                if(checkX === x && checkY === y)
                    continue;
                if(this.aliveCells.has(CalculateHash(checkX, checkY)))
                    aliveAround++;
            }
        }
        if(aliveAround === 3)
            return true;
        if(aliveAround === 2 && this.aliveCells.has(CalculateHash(x, y)))
            return true;
        return false;
    }

    toggleCellAtCoordinate(x : bigint, y : bigint) {
        const c = new Cell(x, y);
        if(this.removeCell(c))
            return;
        this.addCell(c);
    }

    addCell(cell : Cell){
        this.aliveCells.set(cell.GetHash(), cell);
    }

    removeCell(cell : Cell) : boolean{
        return this.aliveCells.delete(cell.GetHash());
    }
}

export class Cell {
    x : bigint;
    y : bigint;

    constructor(x : bigint, y : bigint) {
        this.x = x;
        this.y = y;
    }

    GetHash() : bigint {
        return CalculateHash(this.x, this.y);
    }
}

export function CalculateHash(x: bigint, y : bigint) {
    return x * BigInt(0xffffffff) + y;
}