import dynamic from 'next/dynamic'
import Instructions from '@/components/dom/Instructions'
import { PLYLoader } from 'three-stdlib'
import { hookWow } from '@/store/store'
import nProgress, { done } from 'nprogress'
import { BufferAttribute, BufferGeometry, MeshBasicMaterial, Object3D, Points } from 'three'
import { OrbitControls } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import { useEffect, useMemo, useRef } from 'react'
import { GLTFExporter } from 'three/examples/jsm/exporters/GLTFExporter'
import { PLYExporter } from 'three/examples/jsm/exporters/PLYExporter'
import anime from 'animejs'

// Dynamic import is used to prevent a payload when the website starts, that includes threejs, r3f etc..
// WARNING ! errors might get obfuscated by using dynamic import.
// If something goes wrong go back to a static import to show the error.
// https://github.com/pmndrs/react-three-next/issues/49
const Logo = dynamic(() => import('@/components/canvas/Logo'), { ssr: false })
let surge = { current: 0 }

// Dom components go here
export default function Page(props) {
  let ply = hookWow((s) => s.ply)

  let getNewPLY = (plyGeo) => {
    /** @type {BufferGeometry} */
    let cloned = plyGeo

    let arrPos = []
    let arrCol = []

    let count = cloned.attributes.position.count

    for (let i = 0; i < count; i++) {
      //
      if (i % 2 === 0) {
        arrPos.push(
          //
          cloned.attributes.position.getX(i),
          cloned.attributes.position.getY(i),
          cloned.attributes.position.getZ(i),
        )
        arrCol.push(
          //
          cloned.attributes.color.getX(i),
          cloned.attributes.color.getY(i),
          cloned.attributes.color.getZ(i),
        )
      }
      //
    }

    let buff = new BufferGeometry()
    buff.setAttribute('position', new BufferAttribute(new Float32Array(arrPos), 3))
    buff.setAttribute('color', new BufferAttribute(new Float32Array(arrCol), 3))

    return buff
  }

  let onSurge = () => {
    //
    surge.current = 0

    let v = { current: 0 }
    anime({
      targets: [v],
      current: 10,
      duration: 5500,
      easing: 'linear',
      update: () => {
        surge.current = v.current
      },
      loop: true,
    })
  }
  // let progress = useWow((s) => s.progress)
  return (
    <>
      {(!ply || true) && (
        <Instructions>
          <button
            className='p-3 px-5 mx-3 text-white bg-blue-500 rounded-lg'
            onClick={() => {
              //
              let input = document.createElement('input')
              input.type = 'file'
              input.onchange = (ev) => {
                let first = ev.target?.files[0]

                if (first) {
                  let url = URL.createObjectURL(first)
                  nProgress.start()
                  let plyLoader = new PLYLoader()
                  plyLoader
                    .loadAsync(`${url}`, (ev) => {
                      nProgress.set((ev.loaded / ev.total) * 0.8)
                      // useWow.setState({ progress: ev.loaded / ev.total })
                    })
                    .then((ply) => {
                      //

                      ply = getNewPLY(ply)
                      let o3d = new Object3D()

                      let meshBasic = new MeshBasicMaterial({
                        vertexColors: true,
                      })

                      let mesh = new Points(ply, meshBasic)
                      mesh.rotation.x = Math.PI * -0.5
                      o3d.add(mesh)
                      hookWow.setState({ ply: <primitive object={o3d}></primitive> })

                      let exporter = new PLYExporter()
                      exporter.parse(
                        mesh,
                        (binary) => {
                          console.log(binary)
                          let blo = new Blob([binary], { type: '' })

                          let url2 = URL.createObjectURL(blo)

                          let an = document.createElement('a')
                          an.href = url2
                          an.download = 'reduced.glb'
                          an.click()

                          nProgress.done()
                        },
                        // () => {},
                        { binary: true, excludeAttributes: ['normal'] },
                      )
                    })
                  //
                }
              }
              input.click()
            }}>
            Reduce PLY File
          </button>

          <button
            className='p-3 px-5 mx-3 text-white bg-blue-500 rounded-lg'
            onClick={() => {
              //
              let input = document.createElement('input')
              input.type = 'file'
              input.onchange = (ev) => {
                let first = ev.target?.files[0]

                if (first) {
                  let url = URL.createObjectURL(first)
                  nProgress.start()
                  let plyLoader = new PLYLoader()
                  plyLoader
                    .loadAsync(`${url}`, (ev) => {
                      nProgress.set((ev.loaded / ev.total) * 0.8)
                      // useWow.setState({ progress: ev.loaded / ev.total })
                    })
                    .then((ply) => {
                      //

                      ply.rotateX(-Math.PI * 0.5)

                      hookWow.setState({ geo: ply })
                      nProgress.done()
                      onSurge()
                    })
                  //
                }
              }
              input.click()
            }}>
            Run PLY File
          </button>

          {/*
          {ply && (
            <button
              className='p-3 text-white bg-green-500 rounded-xl'
              onClick={() => {
                onSurge()
              }}>
              Pulse Animation
            </button>
          )} */}
        </Instructions>
      )}
    </>
  )
}

/*
<Logo scale={0.5} route='/blob' position-y={-1} />
*/
// Canvas components go here
// It will receive same props as the Page component (from getStaticProps, etc.)
Page.canvas = (props) => {
  let ply = hookWow((s) => s.ply)

  let geo = hookWow((s) => s.geo)

  let meshBasic = new MeshBasicMaterial({
    vertexColors: true,
  })

  meshBasic.onBeforeCompile = (shader) => {
    shader.uniforms.time = { value: 0 }
    shader.uniforms.surge = { value: 0 }
    let works = () => {
      shader.uniforms.surge.value = surge.current
      shader.uniforms.time.value = window.performance.now() / 1000
    }

    let rAFID = 0
    let rAF = () => {
      rAFID = requestAnimationFrame(rAF)
      works()
    }
    rAFID = requestAnimationFrame(rAF)

    shader.vertexShader = /* glsl */ `
#include <common>
#include <uv_pars_vertex>
#include <uv2_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
uniform float time;
uniform float surge;
void main() {
	#include <uv_vertex>
	#include <uv2_vertex>
	#include <color_vertex>
	#include <morphcolor_vertex>
	#if defined ( USE_ENVMAP ) || defined ( USE_SKINNING )
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinbase_vertex>
		#include <skinnormal_vertex>
		#include <defaultnormal_vertex>
	#endif
	// #include <begin_vertex>
  vec3 transformed = vec3( position );


	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <fog_vertex>


  float dist = length(transformed.xz);

  if (surge <= dist) {
    gl_Position.y += 20.0 * (length(dist - surge));
  }

  gl_PointSize = 1.0;

}

`
  }

  meshBasic.customProgramCacheKey = () => {
    return Math.random()
  }

  return (
    <>
      <group>
        {ply}

        <group rotation={[0.0, 0.0, 0.0]}>
          <points geometry={geo} material={meshBasic}></points>
        </group>

        <OrbitControls></OrbitControls>
        {/* <Logo scale={0.5} route='/blob' position-y={-1} /> */}
      </group>
    </>
  )
}

export async function getStaticProps() {
  return { props: { title: 'AGAPE x Manifold' } }
}
