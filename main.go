package main

import (
	"fmt"
	"image/color"
	"log"
	"math/rand"

	"github.com/hajimehoshi/ebiten/v2"
	"github.com/hajimehoshi/ebiten/v2/ebitenutil"
)

// Game implements ebiten.Game interface.
type Game struct{}

var blocks []*ebiten.Image

const scrW, scrH = 640, 480

func main() {
	game := &Game{}
	blocks = make([]*ebiten.Image, 1)

	ebiten.SetWindowSize(scrW, scrH)
	ebiten.SetWindowTitle("IsoQuest")
	ebiten.SetFPSMode(ebiten.FPSModeVsyncOffMinimum)

	for i := 1; i <= 3; i++ {
		img, _, err := ebitenutil.NewImageFromFile(fmt.Sprintf("assets/block-%d.png", i))
		if err != nil {
			log.Fatal(err)
		}

		blocks = append(blocks, img)
	}

	if err := ebiten.RunGame(game); err != nil {
		log.Fatal(err)
	}
}

func (g *Game) Update() error {
	return nil
}

func (g *Game) Draw(screen *ebiten.Image) {
	screen.Fill(color.RGBA{22, 22, 44, 255})

	for y := 0; y < 5; y++ {
		for x := 0; x < 5; x++ {
			g.drawBlock(screen, x, y, 0)
		}
	}

	g.drawBlock(screen, 2, 0, 1)
	g.drawBlock(screen, 3, 0, 2)
	g.drawBlock(screen, 4, 0, 2)
	g.drawBlock(screen, 3, 4, 1)
}

func (g *Game) drawBlock(screen *ebiten.Image, x, y, z int) {
	op := &ebiten.DrawImageOptions{}
	op.GeoM.Translate(64, 16)
	op.GeoM.Translate(float64(x*16)-float64(y*16), float64(x*8)+float64(y*8)-float64(z*16))

	// random block for now
	block := blocks[rand.Intn(len(blocks)-1)+1]
	screen.DrawImage(block, op)
}

func (g *Game) Layout(outsideWidth, outsideHeight int) (screenWidth, screenHeight int) {
	return scrW / 4, scrH / 4
}
