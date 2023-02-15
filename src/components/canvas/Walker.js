import { createPortal, useFrame, useLoader, useThree } from '@react-three/fiber'
import { useEffect, useMemo, useRef } from 'react'
import { OrbitControls, PerspectiveCamera } from '@react-three/drei'
import { Object3D, Vector3 } from 'three'

export function Walker({ initPos = [1, 0, -1] }) {
  let scene = useThree((s) => s.scene)
  let gl = useThree((s) => s.gl)

  let player = useMemo(() => {
    return new Object3D()
  }, [])
  let camera = useThree((s) => s.camera)
  useEffect(() => {
    player.position.fromArray(initPos)
    camera.position.fromArray(initPos)
    camera.position.z += 1
  }, [camera.position, initPos, player.position])

  let up = new Vector3(0, 1, 0)

  let ControlState = useMemo(() => {
    return {
      keyForward: false,
      keyBackward: false,
      keyLeft: false,
      keyRight: false,
    }
  }, [])

  useEffect(() => {
    let hh = ({ key }) => {
      if (key === 'w') {
        ControlState.keyForward = true
      }
      if (key === 's') {
        ControlState.keyBackward = true
      }

      if (key === 'a') {
        ControlState.keyLeft = true
      }
      if (key === 'd') {
        ControlState.keyRight = true
      }
    }
    window.addEventListener('keydown', hh)
    return () => {
      window.removeEventListener('keydown', hh)
    }
  }, [ControlState])

  useEffect(() => {
    let hh = ({ key }) => {
      if (key === 'w') {
        ControlState.keyForward = false
      }
      if (key === 's') {
        ControlState.keyBackward = false
      }

      if (key === 'a') {
        ControlState.keyLeft = false
      }
      if (key === 'd') {
        ControlState.keyRight = false
      }
    }
    window.addEventListener('keyup', hh)
    return () => {
      window.removeEventListener('keyup', hh)
    }
  }, [ControlState])
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

      <OrbitControls makeDefault args={[camera, gl.domElement]} enableRotate={true}></OrbitControls>
    </>
  )
}
