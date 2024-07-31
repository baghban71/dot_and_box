import Utilities from "../Utilities";

export default class MainGame extends Phaser.Scene {
	/**
	 * Unique name of the scene.
	 */
	public static Name = "MainGame";

	graphics: Phaser.GameObjects.Graphics = null;
	path = null;
	curve: Phaser.Curves.Line[] = [];
	points: { [id: string]: [Phaser.GameObjects.Image, Phaser.Math.Vector2] } = {};;//[Phaser.GameObjects.Image, Number, Number][] = [];
	firstDot: Phaser.GameObjects.Image = null;
	secDot: Phaser.GameObjects.Image = null;
	rowCount = 11;
	columnCount = 9;
	right = 100;
	top = 50;
	rectangleWith = 50;
	lineCount = 0;

	colors = [];

	turnCounter = 0;
	turns = [];
	turnIndex = 0;

	createdLines = [];

	boxesAnchorPoint = [];

	prevBoxCount = 0;

	public preload(): void {
		// Preload as needed.

	}

	public create(): void {
		Utilities.LogSceneMethodEntry("MainGame", "create");
		this.colors = [0xff0000, 0x0000ff];
		this.lineCount = ((this.rowCount - 1) * this.columnCount) + ((this.columnCount - 1) * this.rowCount);

		this.graphics = this.add.graphics();

		this.path = { t: 0, vec: new Phaser.Math.Vector2() };




		for (var lineNum = 0; lineNum < this.lineCount; lineNum++) {
			this.curve[lineNum] = new Phaser.Curves.Line([-10, -10, -60, -40]);
			this.turns[lineNum] = 0;
		}


		//	this.add.image(this.cameras.main.centerX, this.cameras.main.centerY, "Phaser-Logo-Small");
		var pointsCounter = 0;
		for (let column = 0; column < this.columnCount; column++) {
			for (let row = 0; row < this.rowCount; row++) {


				const point = this.add.image((column * this.rectangleWith) + this.right, (row * this.rectangleWith) + this.top, 'dragcircle', 1).setInteractive();
				point.name = pointsCounter.toString();
				this.points[point.name] = [point, new Phaser.Math.Vector2(column, row)];
				this.input.setDraggable([point]);


				pointsCounter++;
			}
		}

		//this.curve[0].p0 = new Phaser.Math.Vector2(this.points[0].x, this.points[0].y);
		//this.curve[0].p1 = new Phaser.Math.Vector2(this.points[1].x, this.points[1].y);

		this.input.on('dragstart', (pointer, gameObject) => {
			gameObject.setFrame(1);
			this.firstDot = gameObject;
			currentRow = this.points[gameObject.name][1].y;
			currentColumn = this.points[gameObject.name][1].x;

			//console.log(gameObject.name, { currentRow, currentColumn });

		});
		this.input.on('dragend', (pointer, gameObject) => {
			gameObject.setFrame(0);

		});
		let currentLineIndex = 0;
		let currentRow = 0;
		let currentColumn = 0;

		this.input.on('pointerover', (event, gameObjects) => {
			gameObjects[0].setFrame(1);
			if (this.firstDot != gameObjects[0] && this.firstDot != null) {
				this.secDot = gameObjects[0];

			}
		});
		this.input.on('pointerout', (event, gameObjects) => {
			gameObjects[0].setFrame(0);
		});

		this.input.on('pointerup', (pointer) => {


			if (this.firstDot != null && this.secDot != null) {

				if (this.firstDot == this.secDot)
					return;

				var r = this.points[this.secDot.name][1].y;
				var c = this.points[this.secDot.name][1].x;
				//console.log(this.secDot.name, { r, c });
				if (currentRow != r && currentColumn != c)
					return;
				if (Math.abs(currentRow - r) > 1 || Math.abs(currentColumn - c) > 1)
					return;
				if (this.createdLines.filter((item) => (item[0] == this.firstDot.name && item[1] == this.secDot.name) || (item[1] == this.firstDot.name && item[0] == this.secDot.name)).length > 0)
					return;



				this.curve[currentLineIndex].p0 = new Phaser.Math.Vector2(this.firstDot.x, this.firstDot.y);
				this.curve[currentLineIndex].p1 = new Phaser.Math.Vector2(this.secDot.x, this.secDot.y);
				currentLineIndex++;
				if (currentLineIndex >= this.curve.length)
					currentLineIndex = 0;


				this.createdLines.push([this.firstDot.name, this.secDot.name]);
				//console.log(this.createdLines);

				this.turns[this.turnIndex] = this.turnCounter;
				if (!this.checkBox())
					this.turnCounter++;
				this.turnIndex++;

				this.firstDot = null;
			}
		});

	}
	public checkBox(): boolean {
		var searachBox = [[0, this.rowCount], [1, this.rowCount + 1], [0, 1], [this.rowCount, this.rowCount + 1]];
		var boxPlaceCount = 0;
		var lineCount = 0;
		var minPoint = 99999;
		for (let column = 0; column < this.columnCount; column++) {
			for (let row = 0; row < this.rowCount-1; row++) {
				//console.log({row})
				lineCount = 0;
				minPoint = 99999;
				searachBox.forEach(element => {
					var pont1 = element[0] + (boxPlaceCount + column);
					var pont2 = element[1] + (boxPlaceCount + column);

					if (pont1 < minPoint)
						minPoint = pont1;
					if (pont2 < minPoint)
						minPoint = pont2;

					if (this.createdLines.filter((item) => (item[0] == pont1 && item[1] == pont2) || (item[1] == pont1 && item[0] == pont2)).length > 0) {
						lineCount++;
					}
				});
				if (lineCount == 4) {
			
					if (this.boxesAnchorPoint.filter((item) => (item.point == minPoint)).length == 0) {
						this.boxesAnchorPoint.push({ point: minPoint, r: row, c: column, turn: this.turnCounter });
						//console.log(this.boxesAnchorPoint)
					}
				}
				boxPlaceCount++;
			}
		}

		if (this.prevBoxCount != this.boxesAnchorPoint.length) {
			this.prevBoxCount = this.boxesAnchorPoint.length;
			return true;
		} else
			return false;
	}
	public reset(): void {

		this.prevBoxCount = 0;

		this.turns = null;
		this.turns = [];

		this.turnCounter = 0;
		this.turnIndex = 0;


		this.createdLines = null;
		this.createdLines = [];


		this.lineCount = ((this.rowCount - 1) * this.columnCount) + ((this.columnCount - 1) * this.rowCount);

		for (var lineNum = 0; lineNum < this.lineCount; lineNum++) {
			if (this.curve[lineNum] == undefined)
				this.curve[lineNum] = new Phaser.Curves.Line([-10, -10, -60, -40]);
			else {
				this.curve[lineNum].p0 = new Phaser.Math.Vector2(-10, -10);
				this.curve[lineNum].p1 = new Phaser.Math.Vector2(-60, -60);
			}

			this.turns[lineNum] = 0;
		}

		this.firstDot = null;
		this.secDot = null;

	}

	public update(time: number, delta: number): void {
		this.graphics.clear();

		for (var lineNum = 0; lineNum < this.createdLines.length; lineNum++) {
			this.graphics.lineStyle(10, this.colors[this.turns[lineNum] % 2], 0.5);
			this.curve[lineNum].draw(this.graphics);
		}

		this.boxesAnchorPoint.forEach((boxAnchorPoint) => {
			this.graphics.fillStyle(this.colors[boxAnchorPoint.turn % 2], 0.2);
			this.graphics.fillRect(
				(boxAnchorPoint.c * this.rectangleWith) + this.right,
				(boxAnchorPoint.r * this.rectangleWith) + this.top,
				this.rectangleWith,
				this.rectangleWith);
		})

	}
}
