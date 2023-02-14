import dynamic from 'next/dynamic'
import Instructions from '@/components/dom/Instructions'
import { PLYLoader } from 'three-stdlib'
import { hookWow } from '@/store/store'
import nProgress from 'nprogress'
import { MeshBasicMaterial, Object3D, Points } from 'three'
import { OrbitControls } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
// Dynamic import is used to prevent a payload when the website starts, that includes threejs, r3f etc..
// WARNING ! errors might get obfuscated by using dynamic import.
// If something goes wrong go back to a static import to show the error.
// https://github.com/pmndrs/react-three-next/issues/49
const Logo = dynamic(() => import('@/components/canvas/Logo'), { ssr: false })

// Dom components go here
export default function Page(props) {
  let ply = hookWow((s) => s.ply)

  // let progress = useWow((s) => s.progress)
  return (
    <>
      {(!ply || true) && (
        <Instructions>
          {
            <button
              className='p-3 px-5 text-white bg-blue-500 rounded-lg'
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
                        let o3d = new Object3D()

                        let meshBasic = new MeshBasicMaterial({
                          vertexColors: true,
                        })

                        meshBasic.onBeforeCompile = (shader) => {
                          shader.uniforms.time = { value: 0 }
                          let works = () => {
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
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <fog_vertex>

  float dist = length(gl_Position.xyz - cameraPosition.xyz);

  if (dist >= 4.0) {
    dist = 4.0;
  }

  gl_Position.y += sin(dist / 4.0 * 3.141592 * 2.0 + time) * 1.0;
  gl_PointSize = ${(devicePixelRatio || 1.0).toFixed(1)};
}

`
                        }

                        let mesh = new Points(ply, meshBasic)
                        mesh.rotation.x = Math.PI * -0.5
                        o3d.add(mesh)
                        hookWow.setState({ ply: <primitive object={o3d}></primitive> })

                        setTimeout(() => {
                          nProgress.done()
                        }, 1000)
                      })
                    //
                  }
                }
                input.click()
              }}>
              Select PLY File
            </button>
          }
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
  return (
    <>
      <group>
        {ply}
        <OrbitControls></OrbitControls>
        {/* <Logo scale={0.5} route='/blob' position-y={-1} /> */}
      </group>
    </>
  )
}

export async function getStaticProps() {
  return { props: { title: 'AGAPE x Manifold' } }
}
