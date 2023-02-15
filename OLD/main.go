package main

import (
	"fmt"
	"image/color"
	"log"
	"path/filepath"
	"sort"
	"strings"

	"github.com/hajimehoshi/ebiten/v2"
	"github.com/hajimehoshi/ebiten/v2/ebitenutil"
)

type Game struct{}
type Sprite struct {
	x float64
	y float64
	z float64
	i *ebiten.Image
}

var imageCache map[string]*ebiten.Image
var sprites []*Sprite
var player *Sprite

const scrW, scrH = 1024, 768

func main() {
	game := &Game{}
	imageCache = make(map[string]*ebiten.Image)
	sprites = []*Sprite{}

	ebiten.SetWindowSize(scrW, scrH)
	ebiten.SetWindowTitle("IsoQuest")
	//ebiten.SetFPSMode(ebiten.FPSModeVsyncOffMinimum)

	loadImage("assets/block-1.png")
	loadImage("assets/block-2.png")
	loadImage("assets/block-3.png")
	loadImage("assets/sphere.png")

	player = &Sprite{0, 0, 1.0, imageCache["sphere"]}

	sprites = append(sprites, player)
	sprites = append(sprites, &Sprite{0, 0, 0, imageCache["block-1"]})
	sprites = append(sprites, &Sprite{1, 0, 0, imageCache["block-1"]})
	sprites = append(sprites, &Sprite{2, 0, 0, imageCache["block-1"]})
	sprites = append(sprites, &Sprite{3, 0, 0, imageCache["block-1"]})
	sprites = append(sprites, &Sprite{0, 1, 0, imageCache["block-1"]})
	sprites = append(sprites, &Sprite{1, 1, 0, imageCache["block-1"]})
	sprites = append(sprites, &Sprite{2, 1, 0, imageCache["block-1"]})
	sprites = append(sprites, &Sprite{3, 1, 0, imageCache["block-1"]})
	sprites = append(sprites, &Sprite{0, 2, 0, imageCache["block-2"]})
	sprites = append(sprites, &Sprite{1, 2, 0, imageCache["block-2"]})
	sprites = append(sprites, &Sprite{2, 2, 0, imageCache["block-2"]})
	sprites = append(sprites, &Sprite{3, 2, 0, imageCache["block-2"]})

	sprites = append(sprites, &Sprite{1, 0, 1, imageCache["block-2"]})
	sprites = append(sprites, &Sprite{3, 0, 1, imageCache["block-2"]})

	sprites = append(sprites, &Sprite{1, 0, 2, imageCache["block-3"]})
	sprites = append(sprites, &Sprite{2, 0, 2, imageCache["block-3"]})
	sprites = append(sprites, &Sprite{3, 0, 2, imageCache["block-3"]})

	if err := ebiten.RunGame(game); err != nil {
		log.Fatal(err)
	}
}

func loadImage(path string) {
	if imageCache[path] == nil {
		img, _, err := ebitenutil.NewImageFromFile(path)
		if err != nil {
			log.Fatal(err)
		}

		name := filepath.Base(path)
		name = strings.Replace(name, ".png", "", -1)

		imageCache[name] = img
	}
}

func (g *Game) Update() error {
	if ebiten.IsKeyPressed(ebiten.KeyArrowDown) {
		player.y += 0.03
	}

	if ebiten.IsKeyPressed(ebiten.KeyArrowUp) {
		player.y -= 0.03
	}

	if ebiten.IsKeyPressed(ebiten.KeyArrowLeft) {
		player.x -= 0.03
	}

	if ebiten.IsKeyPressed(ebiten.KeyArrowRight) {
		// newX := player.x + 0.03
		// for i := 0; i < len(sprites); i++ {
		// 	if sprites[i] == player {
		// 		continue
		// 	}

		// 	if newX >= sprites[i].x && player.y <= sprites[i].y {
		// 		return nil
		// 	}
		// }
		player.x += 0.03
	}

	if ebiten.IsKeyPressed(ebiten.KeyQ) {
		player.z += 0.01
	}

	if ebiten.IsKeyPressed(ebiten.KeyA) {
		player.z -= 0.01
	}

	sort.Slice(sprites, func(i, j int) bool {
		d := (sprites[i].x*1.5 + sprites[i].y*1.5 + sprites[i].z*1.7) - (sprites[j].x*1.5 + sprites[j].y*1.5 + sprites[j].z*1.7)
		return d < 0
	})

	return nil
}

func (g *Game) Draw(screen *ebiten.Image) {
	screen.Fill(color.RGBA{22, 22, 44, 255})
	ebitenutil.DebugPrintAt(screen, fmt.Sprintf("Player: %0.2f, %0.2f, %0.2f", player.x, player.y, player.z), 0, 0)

	for i := 0; i < len(sprites); i++ {
		sprites[i].draw(screen)
	}
}

func (s *Sprite) draw(screen *ebiten.Image) {
	op := &ebiten.DrawImageOptions{}
	op.GeoM.Translate(scrW/4/2, scrH/4/2)
	op.GeoM.Translate(projectIso(s.x*16, s.y*16, s.z*16))

	screen.DrawImage(s.i, op)
}

func projectIso(x, y, z float64) (float64, float64) {
	return x - y, (x / 2) + (y / 2) - z
}

func (g *Game) Layout(outsideWidth, outsideHeight int) (screenWidth, screenHeight int) {
	return outsideWidth / 4, outsideHeight / 4
}
