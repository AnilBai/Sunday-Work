import { Canvas, useFrame } from '@react-three/fiber'
import { useMemo, useRef, type MutableRefObject } from 'react'
import * as THREE from 'three'

function Planet({ progress }: { progress: MutableRefObject<number> }) {
  const group = useRef<THREE.Group>(null)
  const globe = useRef<THREE.Mesh>(null)
  const moon = useRef<THREE.Mesh>(null)
  const reduced = useMemo(() => matchMedia('(prefers-reduced-motion: reduce)').matches, [])
  const material = useMemo(() => new THREE.ShaderMaterial({
    uniforms: { lightDirection: {value: new THREE.Vector3(-.6,.6,1).normalize()} },
    vertexShader: `varying vec3 vNormal; varying vec3 vPosition;
      void main(){vNormal=normalize(normalMatrix*normal);vPosition=position;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`,
    fragmentShader: `varying vec3 vNormal;varying vec3 vPosition;uniform vec3 lightDirection;
      void main(){
        float bands=sin(vPosition.y*19.+sin(vPosition.x*5.+vPosition.z*4.)*.7)*.5+.5;
        float fine=sin(vPosition.y*54.+sin(vPosition.z*9.)*.8)*.5+.5;
        vec3 blue=mix(vec3(.025,.12,.35),vec3(.2,.49,.88),bands*.65+fine*.15);
        float storm=exp(-length((vPosition.xy-vec2(.6,-.4))*vec2(2.,4.)));
        blue=mix(blue,vec3(.54,.73,.94),storm*.5);
        float light=max(dot(normalize(vNormal),lightDirection),0.);
        float rim=pow(1.-max(dot(normalize(vNormal),vec3(0.,0.,1.)),0.),3.);
        gl_FragColor=vec4(blue*(.06+light*.95)+vec3(.12,.35,.8)*rim*.6,1.);
      }`,
  }),[])
  useFrame(({clock,size})=>{
    const p=progress.current
    const travel=THREE.MathUtils.smoothstep(p,.12,.85)
    const t=reduced?0:clock.elapsedTime
    if(group.current){
      const mobile=size.width<760
      group.current.position.set((mobile?0:2.9)*(1-travel)-travel*3,(mobile?1.45:.25)*(1-travel),travel*7)
      group.current.rotation.z=-.22+travel*.25
      group.current.scale.setScalar(mobile?.71:1.1)
    }
    if(globe.current)globe.current.rotation.y=t*.035+p*.6
    if(moon.current){moon.current.position.set(Math.cos(t*.08+p*4)*4,Math.sin(t*.08+p*4)*1.8,-2+Math.sin(t*.08+p*4)*2)}
  })
  return <group ref={group}>
    <mesh ref={globe} material={material}><sphereGeometry args={[1.65,96,64]}/></mesh>
    <mesh scale={1.025}><sphereGeometry args={[1.65,64,48]}/><meshBasicMaterial color="#287eff" transparent opacity={.09} side={THREE.BackSide}/></mesh>
    <group rotation={[1.13,.18,.1]}>
      {Array.from({length:32},(_,i)=><mesh key={i}>
        <ringGeometry args={[2.08+i*.026,2.095+i*.026,160]}/>
        <meshStandardMaterial color={i%5===0?'#60728f':i%3===0?'#b8cbe6':'#859bbe'} emissive="#30486e" emissiveIntensity={.35} metalness={.15} roughness={.8} side={THREE.DoubleSide} transparent opacity={i%7===0?.2:.7}/>
      </mesh>)}
    </group>
    <mesh ref={moon}><sphereGeometry args={[.26,40,32]}/><meshStandardMaterial color="#b6bbc9" roughness={1}/></mesh>
  </group>
}
function Space({progress}: {progress: MutableRefObject<number>}) {
  const stars = useRef<THREE.Points>(null)
  const distant = useRef<THREE.Group>(null)
  const reduced = useMemo(() => matchMedia('(prefers-reduced-motion: reduce)').matches, [])
  const geometry=useMemo(()=>{
    const positions=new Float32Array(1600*3)
    for(let i=0;i<1600;i++){
      const a=i*2.399963,r=3+((i*37)%199)/199*28
      positions[i*3]=Math.cos(a)*r;positions[i*3+1]=Math.sin(a)*r;positions[i*3+2]=-((i*71)%197)/197*65
    }
    const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.BufferAttribute(positions,3));return g
  },[])
  useFrame(({camera,clock})=>{
    const p=progress.current,t=reduced?0:clock.elapsedTime
    const travel=THREE.MathUtils.smoothstep(p,.2,1)
    camera.position.set(Math.sin(travel*Math.PI)*.7,0,12-travel*20)
    camera.lookAt(0,0,-15*travel)
    if(stars.current){stars.current.rotation.z=p*.14+t*.002;stars.current.position.z=travel*12}
    if(distant.current)distant.current.rotation.y=t*.012+p*.2
  })
  return <>
    <color attach="background" args={['#030610']}/>
    <fog attach="fog" args={['#030610',35,80]}/>
    <ambientLight intensity={.35}/>
    <directionalLight position={[-5,6,8]} intensity={3.5} color="#d8e8ff"/>
    <pointLight position={[8,-3,-8]} intensity={45} color="#627dff"/>
    <points ref={stars} geometry={geometry}><pointsMaterial color="#d7e8ff" size={.025} transparent opacity={.9} sizeAttenuation/></points>
    <Planet progress={progress}/>
    <group ref={distant}>
      <mesh position={[-5,2.5,-12]}><sphereGeometry args={[.75,48,32]}/><meshStandardMaterial color="#b47a5f" roughness={1}/></mesh>
      <mesh position={[5,-2,-20]}><sphereGeometry args={[1.1,48,32]}/><meshStandardMaterial color="#658aa9" roughness={.85}/></mesh>
      <mesh position={[0,1,-32]}><sphereGeometry args={[2,48,32]}/><meshStandardMaterial color="#282c57" roughness={.9}/></mesh>
    </group>
  </>
}
export default function HeroRoom({ progress }: { progress: MutableRefObject<number> }) {
  return <Canvas camera={{position:[0,0,12],fov:48}} dpr={[1,1.5]} gl={{antialias:true}} aria-hidden="true"><Space progress={progress}/></Canvas>
}
