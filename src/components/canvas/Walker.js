import { createPortal, useFrame, useLoader, useThree } from '@react-three/fiber'
import { useEffect, useMemo, useRef, useState } from 'react'
import { Box, Environment, OrbitControls, PerspectiveCamera, RoundedBox, useFBX, useGLTF } from '@react-three/drei'
import { AnimationMixer, MathUtils, Object3D, Vector3 } from 'three'
import { useCore } from './useCore'

export function Walker({ initPos = [1, 0, -1] }) {
  let avaGLB = useGLTF(`/assets/2022-02-15/black-t-shirt.glb`)

  let {
    animations: [running],
  } = useFBX(`/assets/2022-02-15/rpm-locomotion/running.fbx`)
  let {
    animations: [idle],
  } = useFBX(`/assets/2022-02-15/rpm-locomotion/standing.fbx`)

  let self = useMemo(() => {
    return {
      keyState: {
        fwdPressed: false,
        bkdPressed: false,
        lftPressed: false,
        rgtPressed: false,
        joyStickDown: false,
        joyStickAngle: 0,
        joyStickPressure: 0,
        joyStickSide: 0,
      },
    }
  }, [])
  let ControlState = useMemo(() => {
    return {
      keyForward: false,
      keyBackward: false,
      keyLeft: false,
      keyRight: false,
    }
  }, [])

  let mixer = useMemo(() => {
    return new AnimationMixer(avaGLB.scene)
  }, [avaGLB])
  useFrame((r, dt) => {
    mixer.update(dt)
  })
  let actRun = mixer.clipAction(running)
  let actIdle = mixer.clipAction(idle)
  let [shouldRun, setAct] = useState(actIdle)

  useEffect(() => {
    actIdle.play()
  }, [actIdle])
  let last = useRef(actIdle)
  useEffect(() => {
    shouldRun?.reset()?.play()
    last.current = shouldRun
    return () => {
      last?.current?.reset()?.fadeOut(0.2)
    }
  }, [shouldRun])

  avaGLB.scene.traverse((it) => {
    it.frustumCulled = false
  })
  useFrame(({ controls }, dt) => {
    if (controls) {
      if (
        self.keyState.joyStickDown ||
        ControlState.keyForward ||
        ControlState.keyBackward ||
        ControlState.keyLeft ||
        ControlState.keyRight
      ) {
        //

        if (self.keyState.joyStickDown) {
          //.
        } else if (ControlState.keyForward) {
          avaGLB.scene.rotation.y = MathUtils.damp(
            avaGLB.scene.rotation.y,
            controls.getAzimuthalAngle() + Math.PI,
            1,
            dt * 10,
          )
        } else if (ControlState.keyBackward) {
          avaGLB.scene.rotation.y = MathUtils.damp(
            avaGLB.scene.rotation.y,
            controls.getAzimuthalAngle() + Math.PI + Math.PI,
            1,
            dt * 10,
          )
        } else if (ControlState.keyLeft) {
          avaGLB.scene.rotation.y = MathUtils.damp(
            avaGLB.scene.rotation.y,
            controls.getAzimuthalAngle() + Math.PI + Math.PI * 0.5,
            1,
            dt * 10,
          )
        } else if (ControlState.keyRight) {
          avaGLB.scene.rotation.y = MathUtils.damp(
            avaGLB.scene.rotation.y,
            controls.getAzimuthalAngle() + Math.PI + Math.PI * -0.5,
            1,
            dt * 10,
          )
        }
      }
    }
  })
  //
  let scene = useThree((s) => s.scene)
  let gl = useThree((s) => s.gl)

  let core = useCore()
  let player = useMemo(() => {
    return new Object3D()
  }, [])
  let camera = useThree((s) => s.camera)
  useEffect(() => {
    player.position.fromArray(initPos)
    camera.position.fromArray(initPos)
    camera.position.z += 0.5
    camera.position.y += 0.5
  }, [camera.position, initPos, player.position])

  let up = new Vector3(0, 1, 0)

  useEffect(() => {
    let hh = ({ key }) => {
      if (key === 'w') {
        ControlState.keyForward = true
        setAct(actRun)
      }
      if (key === 's') {
        setAct(actRun)
        ControlState.keyBackward = true
      }

      if (key === 'a') {
        setAct(actRun)
        ControlState.keyLeft = true
      }
      if (key === 'd') {
        setAct(actRun)
        ControlState.keyRight = true
      }
    }
    window.addEventListener('keydown', hh)
    return () => {
      window.removeEventListener('keydown', hh)
    }
  }, [ControlState, actRun, mixer])

  useEffect(() => {
    let hh = ({ key }) => {
      if (key === 'w') {
        ControlState.keyForward = false
        setAct(actIdle)
      }
      if (key === 's') {
        ControlState.keyBackward = false
        setAct(actIdle)
      }

      if (key === 'a') {
        ControlState.keyLeft = false
        setAct(actIdle)
      }
      if (key === 'd') {
        ControlState.keyRight = false
        setAct(actIdle)
      }
    }
    window.addEventListener('keyup', hh)
    return () => {
      window.removeEventListener('keyup', hh)
    }
  }, [ControlState, actIdle])
  useFrame((st, dt) => {
    if (st.controls) {
      if (ControlState.keyForward) {
        let v3 = new Vector3(0, 0, -1)
        v3.applyAxisAngle(up, st.controls.getAzimuthalAngle())
        player.position.addScaledVector(v3, dt * 10.0)
      }

      if (ControlState.keyBackward) {
        let v3 = new Vector3(0, 0, -1)
        v3.applyAxisAngle(up, st.controls.getAzimuthalAngle() + Math.PI)
        player.position.addScaledVector(v3, dt * 10.0)
      }

      if (ControlState.keyLeft) {
        let v3 = new Vector3(0, 0, -1)
        v3.applyAxisAngle(up, st.controls.getAzimuthalAngle() + 0.5 * Math.PI)
        player.position.addScaledVector(v3, dt * 10.0)
      }
      if (ControlState.keyRight) {
        let v3 = new Vector3(0, 0, -1)
        v3.applyAxisAngle(up, st.controls.getAzimuthalAngle() + -0.5 * Math.PI)
        player.position.addScaledVector(v3, dt * 10.0)
      }
    }
    // Fetch fresh data from store
  })

  useFrame(({ camera, controls }) => {
    if (controls) {
      camera.position.sub(controls.target)
      controls.target.copy(player.position)
      camera.position.add(player.position)
      console.log(player.position.toArray())
    }
  })

  useEffect(() => {
    import('nipplejs')
      .then((s) => {
        return s.default
      })
      .then(async (nip) => {
        let zone = document.createElement('div')
        zone.id = 'avacontrols'
        document.body.appendChild(zone)

        // zone.style.cssText = `
        //   display: flex;
        //   justify-content: center;
        //   align-items:center;
        //   position: absolute;
        //   z-index: 200;
        //   bottom: calc(100px / 2);
        //   left: calc(50% - 100px / 2);
        //   width: 100px;
        //   height: 100px;
        // `
        //
        zone.style.zIndex = '100'
        zone.style.position = 'absolute'
        zone.style.display = 'flex'
        zone.style.justifyContent = 'center'
        zone.style.alignItems = 'center'
        zone.style.left = 'calc(50% - 125px / 2)'
        zone.style.bottom = 'calc(125px / 2)'
        zone.style.width = 'calc(125px)'
        zone.style.height = 'calc(125px)'
        zone.style.borderRadius = 'calc(125px)'
        zone.style.userSelect = 'none'
        // zone.style.backgroundColor = 'rgba(0,0,0,1)'
        zone.style.backgroundImage = `url(/hud/walk.png)`
        zone.style.backgroundSize = `cover`
        let dynamic = nip.create({
          color: 'white',
          zone: zone,
          mode: 'dynamic',
        })

        dynamic.on('added', (evt, nipple) => {
          dynamic.on('start move end dir plain', (evta, data) => {
            if (evta.type === 'start') {
              setAct(actRun)
              self.keyState.joyStickDown = true
            }

            let distance = core.now.controls.getDistance()
            let speed = 1

            if (data?.angle?.radian) {
              //
              // //
              // if (data?.direction?.angle === 'up') {
              //   self.keyState.joyStickSide = data.angle.radian - Math.PI * 0.5

              //   self.keyState.joyStickPressure =
              //     (Math.min(Math.abs(data.distance / 50.0) * 4, 5) / 5.0) *
              //     speed

              //   //
              // } else if (data?.direction?.angle === 'right') {
              //   if (data.direction.y == 'up') {
              //     self.keyState.joyStickSide = data.angle.radian - Math.PI * 0.5
              //   } else {
              //     self.keyState.joyStickSide =
              //       data.angle.radian - Math.PI * 2.0 - Math.PI * 0.5
              //   }

              //   self.keyState.joyStickPressure =
              //     (Math.min(Math.abs(data.distance / 50.0) * 4, 5) / 5.0) *
              //     speed
              // } else if (data?.direction?.angle === 'left') {
              //   self.keyState.joyStickSide = data.angle.radian - Math.PI * 0.5

              //   self.keyState.joyStickPressure =
              //     (Math.min(Math.abs(data.distance / 50.0) * 4, 5) / 5.0) *
              //     speed
              // } else {
              //   self.keyState.joyStickSide = data.angle.radian - Math.PI * 0.5
              //   self.keyState.joyStickPressure =
              //     (Math.min(Math.abs(data.distance / 50.0) * 4, 5) / 5.0) *
              //     speed *
              //     -1.0
              // }

              // console.log(data.vector.y)
              // if (data?.direction?.y == 'up') {
              //   self.keyState.joyStickPressure = data.vector.y
              // } else if (data?.direction?.y == 'down') {
              // }

              self.keyState.joyStickPressure = data.vector.y
              self.keyState.joyStickSide = -data.vector.x * 0.8

              if (self.keyState.joyStickPressure <= -1) {
                self.keyState.joyStickPressure = -1
              }
              if (self.keyState.joyStickPressure >= 1) {
                self.keyState.joyStickPressure = 1
              }

              if (self.keyState.joyStickSide >= Math.PI * 0.5) {
                self.keyState.joyStickSide = Math.PI * 0.5
              }
              if (self.keyState.joyStickSide <= -Math.PI * 0.5) {
                self.keyState.joyStickSide = -Math.PI * 0.5
              }

              //
              self.keyState.joyStickAngle = data.angle.radian + Math.PI * 1.5
            }

            if (evta.type === 'end') {
              setAct(actIdle)

              self.keyState.joyStickDown = false
            }
          })
          nipple.on('removed', () => {
            nipple.off('start move end dir plain')
          })

          core.onClean(() => {
            nipple.destroy()
          })
        })
      })
  }, [core, self.keyState])

  let tempVector = new Vector3()
  let upVector = new Vector3(0, 1, 0)
  let globalCameraPos = new Vector3()
  let deltaRot = new Vector3()
  let playerSpeed = 10
  useFrame(({ controls }, delta) => {
    if (!controls) {
      return
    }
    let angle = controls.getAzimuthalAngle()
    if (self.keyState.joyStickDown) {
      tempVector.set(0, 0, -1).applyAxisAngle(upVector, angle + self.keyState.joyStickAngle)

      controls.object.getWorldPosition(globalCameraPos)
      globalCameraPos.y = controls.target.y
      let dist = controls.target.distanceTo(globalCameraPos)

      deltaRot.setFromCylindricalCoords(
        dist,
        controls.getAzimuthalAngle() + 0.2 * delta * self.keyState.joyStickSide * 15.0,
      )
      let y = camera.position.y
      camera.position.sub(controls.target)
      camera.position.copy(deltaRot)
      camera.position.add(controls.target)
      camera.position.y = y

      player.position.addScaledVector(tempVector, playerSpeed * delta * self.keyState.joyStickPressure * 0.75)
      avaGLB.scene.rotation.y = self.keyState.joyStickAngle + Math.PI + controls.getAzimuthalAngle()
    }
  })

  return (
    <>
      {createPortal(
        <>
          <primitive object={camera}></primitive>
          {/*  */}
          {/*  */}
        </>,
        scene,
      )}
      {createPortal(
        <group position={[0, -1.0, 0]}>
          <primitive object={avaGLB.scene} />
        </group>,
        player,
      )}
      <Environment preset='apartment'></Environment>
      <primitive object={player}></primitive>
      <OrbitControls makeDefault args={[camera, gl.domElement]} enableRotate={true}></OrbitControls>
    </>
  )
}
