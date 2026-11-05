import React, { useEffect, useRef, useState } from 'react';
import * as serverApi from '@/serverApi';
import styled from 'styled-components';
import ActButton from '@/components/ActButton';
import TextInput from './components/TextInput';

const Container = styled.div`
  width: 100%;
  min-width:1024px;
  height: 100dvh;
  min-height: 0;
  overflow: hidden;
  box-sizing: border-box;
  background: #f5f7fb;
  color: #18243b;
  font-family: inherit;
`;

const PageContent = styled.div`
  width: 100%;
  max-width: 1600px;
  margin: 0 auto;
  padding: 24px clamp(16px, 3vw, 48px);
  height: 100%;
  min-height: 0;
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
`;

const Header = styled.header`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 20px;
  margin-bottom: 20px;
  flex-shrink: 0;
  flex-wrap: wrap;
`;

const Brand = styled.div`
  display: flex;
  align-items: center;
  gap: 14px;
`;

const BrandMark = styled.div`
  display: grid;
  place-items: center;
  width: 48px;
  height: 48px;
  border-radius: 15px;
  background: #be3031;
  color: white;
  font-size: 21px;
  font-weight: 800;
  letter-spacing: -1px;
  box-shadow: 0 8px 18px rgba(37, 99, 235, .17);
`;

const PageTitle = styled.h1`
  margin: 0;
  font-size: clamp(21px, 2vw, 27px);
  font-weight: 750;
  line-height: 1.3;
  letter-spacing: -.6px;
`;

const PageDescription = styled.p`
  margin: 5px 0 0;
  color: #728096;
  font-size: 13px;
`;

const Layout = styled.div`
  display: grid;
  grid-template-columns: minmax(0, 1.15fr) minmax(390px, .85fr);
  gap: 20px;
  flex: 1;
  min-height: 0;
  align-items: stretch;

  & > :first-child { align-self: start; }

`;

const Panel = styled.section`
  background: #fff;
  border: 1px solid #e7ecf4;
  border-radius: 20px;
  box-shadow: 0 8px 32px rgba(31, 49, 85, .045);
  overflow: hidden;
`;

const PanelHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 12px;
  padding: 19px 22px;
  border-bottom: 1px solid #edf1f6;
`;

const PanelTitle = styled.h2`
  font-size: 16px;
  font-weight: 720;
  margin: 0;
`;

const PanelSubtitle = styled.p`
  color: #8a96a8;
  font-size: 12px;
  margin: 4px 0 0;
`;

const Status = styled.span<{ $detected: boolean }>`
  display: inline-flex;
  align-items: center;
  gap: 7px;
  border-radius: 999px;
  padding: 6px 10px;
  background: ${({ $detected }) => $detected ? '#eaf9ef' : '#f2f5f9'};
  color: ${({ $detected }) => $detected ? '#15803d' : '#64748b'};
  font-size: 12px;
  font-weight: 650;
  &::before {
    content: '';
    width: 7px;
    height: 7px;
    border-radius: 50%;
    background: ${({ $detected }) => $detected ? '#22c55e' : '#94a3b8'};
  }
`;

const ImageContainer = styled.div`
  padding: 18px;
`;

const CameraFrame = styled.div`
  position: relative;
  width: 100%;
  aspect-ratio: 16 / 9;
  border-radius: 14px;
  overflow: hidden;
  background: #101b2d;
  box-shadow: inset 0 0 0 1px rgba(255, 255, 255, .1);
`;

const CameraImage = styled.img`
  display: block;
  width: 100%;
  height: 100%;
  object-fit: fill;
`;

const CameraOverlay = styled.svg`
  position: absolute;
  inset: 0;
  height: 100%;
  width: 100%;
  pointer-events: none;
`;

const Performance = styled.div`
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 10px;
  padding: 16px 0 2px;
  @media (max-width: 540px) { grid-template-columns: repeat(2, 1fr); }
`;

const PerformanceItem = styled.div`
  padding: 12px 10px;
  background: #f8fafc;
  border: 1px solid #edf1f7;
  border-radius: 11px;
  text-align: center;
`;

const MetricLabel = styled.div`
  color: #7d899b;
  font-size: 11px;
  margin-bottom: 6px;
`;

const MetricValue = styled.div`
  font-size: 19px;
  font-weight: 750;
  color: #24344f;
  font-variant-numeric: tabular-nums;
  span { font-size: 11px; color: #94a3b8; font-weight: 500; }
`;

const ActionBar = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 12px;
  padding: 0 18px 18px;
`;

const ActionWrapper = styled.div<{$disabled?: boolean }>`
  flex: 1;
  min-width: 135px;
  opacity: ${({ $disabled }) => $disabled ? .65 : 1};
  pointer-events: ${({ $disabled }) => $disabled ? 'none' : 'auto'};
  & > * { width: 100%; }
`;

const InfoContainer = styled(Panel)`
  min-width: 0;
  min-height: 0;
  height: 100%;
  display: flex;
  flex-direction: column;

  & > ${PanelHeader} { flex-shrink: 0; }

`;

const FormBody = styled.div`
  padding: 22px;
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  overscroll-behavior: contain;
  scrollbar-width: thin;
  scrollbar-color: #cbd5e1 transparent;
  &::-webkit-scrollbar { width: 7px; }
  &::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 999px; }
  &::-webkit-scrollbar-track { background: transparent; }
`;

const FormSection = styled.div`
  &:not(:last-child) {
    padding-bottom: 20px;
    margin-bottom: 20px;
    border-bottom: 1px solid #edf1f6;
  }
`;

const SectionTitle = styled.h3`
  margin: 0 0 15px;
  font-size: 13px;
  font-weight: 750;
  color: #334155;
`;

const FieldGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 14px;
  @media (max-width: 560px) { grid-template-columns: 1fr; }
`;

const Frame = styled.div<{ $full?: boolean }>`
  display: flex;
  flex-direction: column;
  min-width: 0;
  gap: 7px;
  grid-column: ${({ $full }) => $full ? '1 / -1' : 'auto'};
`;

const FieldLabel = styled.label`
  font-size: 12px;
  font-weight: 650;
  color: #65748a;
`;

const InputWrap = styled.div`
  width: 100%;
  min-width: 0;
  & > * { width: 100%; box-sizing: border-box; }
`;

const FormHint = styled.p`
  color: #94a3b8;
  margin: 15px 0 0;
  font-size: 12px;
  line-height: 1.6;
`;

const ErrorMessage = styled.div`
  padding: 0 18px 16px;
  color: #b91c1c;
  font-size: 12px;
`;

export interface VcardInfo {
  address: string;
  addressEn: string;
  company: string;
  companyEn: string;
  companyUrl: string;
  dept: string;
  email: string;
  mobile: string;
  name: string;
  nameEn: string;
  phone: string;
  title: string;
}


const isValidQuad = (
  points: { x: number; y: number }[],
  imageWidth: number,
  imageHeight: number,
  minAngle = 60,
  maxAngle = 120,
  minSideRatio = 0.6,
  minAreaRatio = 0.5,
  maxAreaRatio = 0.9
): boolean => {
  if (points.length !== 4 || imageWidth <= 0 || imageHeight <= 0)
    return false;

  if (points.some(p => !Number.isFinite(p.x) || !Number.isFinite(p.y)))
    return false;

  const cross = (a: typeof points[0], b: typeof points[0], c: typeof points[0]) =>
    (b.x - a.x) * (c.y - b.y) -
    (b.y - a.y) * (c.x - b.x);

  const distance = (a: typeof points[0], b: typeof points[0]) =>
    Math.hypot(a.x - b.x, a.y - b.y);

  // 1. 凸四邊形
  const signs = points.map((_, i) =>
    cross(points[i], points[(i + 1) % 4], points[(i + 2) % 4])
  );

  if (!signs.every(v => v > 0) && !signs.every(v => v < 0))
    return false;

  // 2. 對邊比例
  const sides = points.map((p, i) =>
    distance(p, points[(i + 1) % 4])
  );

  for (const [a, b] of [[0, 2], [1, 3]]) {
    if (Math.min(sides[a], sides[b]) /
        Math.max(sides[a], sides[b]) < minSideRatio)
      return false;
  }

  // 3. 四個內角
  for (let i = 0; i < 4; i++) {
    const prev = points[(i + 3) % 4];
    const curr = points[i];
    const next = points[(i + 1) % 4];

    const ax = prev.x - curr.x;
    const ay = prev.y - curr.y;
    const bx = next.x - curr.x;
    const by = next.y - curr.y;

    const denominator = Math.hypot(ax, ay) * Math.hypot(bx, by);
    if (denominator === 0) return false;

    const cosine = (ax * bx + ay * by) / denominator;
    const angle = Math.acos(
      Math.max(-1, Math.min(1, cosine))
    ) * 180 / Math.PI;

    if (!Number.isFinite(angle) || angle < minAngle || angle > maxAngle)
      return false;
  }

  // 4. 四邊形面積占整張影像的比例
  const area = Math.abs(
    points.reduce((sum, p, i) => {
      const next = points[(i + 1) % 4];
      return sum + p.x * next.y - next.x * p.y;
    }, 0)
  ) / 2;

  const areaRatio = area / (imageWidth * imageHeight);

  if (areaRatio < minAreaRatio || areaRatio > maxAreaRatio)
    return false;

  return true;
};

function App() {
  const imgRef = useRef<HTMLImageElement>(null);
  const busyRef = useRef(false);
  const [result, setResult] = useState<any>(null);
  const fetchController = React.useRef<AbortController | null>(null);
  const [isIdentifying, setIsIdentifying] = useState(false);
  const [identifyError, setIdentifyError] = useState('');
  const [vcardInfo, setVcardInfo] = useState<VcardInfo>({
    address: '', addressEn: '', company: '', companyEn: '', companyUrl: '',
    dept: '', email: '', mobile: '', name: '', nameEn: '', phone: '', title: '',
  });
  const [eventName, setEventName] = React.useState<string>('');
  const refEventName = React.useRef<string>('');
  const [currentState,setCurrentState] = React.useState<number>(1);
  const refCurrentState = React.useRef<number>(1);
  const hold = React.useRef<boolean>(false);
  const standbyCnt = React.useRef<number>(0);

  useEffect(() => {
    changeLEDState(currentState)
    refCurrentState.current = currentState;
    // console.log(`state changed:${currentState}`)
  },[currentState])

  useEffect(() => {
    const canvas = document.createElement('canvas');
    const visionTimer = setInterval(async () => {
      const img = imgRef.current;
      if (busyRef.current || !img?.naturalWidth) return;

      busyRef.current = true;

      try {
        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;
        canvas.getContext('2d')!.drawImage(img, 0, 0);

        const blob = await new Promise<Blob | null>(
          resolve => canvas.toBlob(resolve, 'image/jpeg', 0.85)
        );
        if (!blob) return;

        const form = new FormData();
        form.append('file', blob, 'frame.jpg');

        const res = await fetch('/api/vision/detect', {
          method: 'POST',
          body: form
        });

        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        const corners = data.corners ? [
            data.corners.topLeft,
            data.corners.topRight,
            data.corners.bottomRight,
            data.corners.bottomLeft
          ]
        : [];

        const isDetected = data.success&&isValidQuad(corners, data.width, data.height);
        if(!isDetected&&refCurrentState.current>3)standbyCnt.current++;
        if(standbyCnt.current>=2){
          standbyCnt.current = 0;
          hold.current = false;
        }
        if(!hold.current){
          refCurrentState.current = isDetected?2:1;
          setCurrentState(refCurrentState.current);
        }
        
        setResult({
          ...data,
          detected: isDetected,
          image: {
            width: data.width,
            height: data.height
          },
          corners: data.corners
            ? [
                [data.corners.topLeft.x, data.corners.topLeft.y],
                [data.corners.topRight.x, data.corners.topRight.y],
                [data.corners.bottomRight.x, data.corners.bottomRight.y],
                [data.corners.bottomLeft.x, data.corners.bottomLeft.y]
              ]
            : []
        });
      } catch (err) {
        console.error(err);
      } finally {
        busyRef.current = false;
      }
    }, 300);
    
    changeLEDState(1);

    return () => {
      clearInterval(visionTimer);
    }
  }, []);

  const handleCapture = () => {
    const img = imgRef.current;
    if (!img?.naturalWidth) return;

    const canvas = document.createElement('canvas');
    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.drawImage(img, 0, 0);

    canvas.toBlob((blob) => {
      if (!blob) return;

      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');

      a.href = url;
      a.download = 'business-card.jpg';
      a.click();

      setTimeout(() => URL.revokeObjectURL(url), 1000);
    }, 'image/jpeg', 0.85);
  };


  const identifyCard = React.useCallback(async () => {
    const img = imgRef.current;
    if (!img?.naturalWidth || isIdentifying) return;

    setIsIdentifying(true);
    setCurrentState(3);
    hold.current = true;
    setIdentifyError('');
    try {
      const canvas = document.createElement('canvas');
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      canvas.getContext('2d')!.drawImage(img, 0, 0);

      const blob = await new Promise<Blob | null>(resolve =>
        canvas.toBlob(resolve, 'image/jpeg', 0.85)
      );
      if (!blob) throw new Error('無法擷取相機畫面');

      const files = [{
        fid: crypto.randomUUID(),
        fileInfo: new File([blob], 'capture.jpg', { type: 'image/jpeg' })
      }];

      fetchController.current = new AbortController();
      g_serverCommError = false;
      const response = await serverApi.uoloadResolveVcard({eventName:refEventName.current}, files, fetchController.current);
      // console.log(response)
      if (g_serverCommError || response.status !== 0) {
        setCurrentState(5);
        throw new Error('名片辨識失敗，請重新嘗試');
      }
      setCurrentState(4);
      setVcardInfo(prev => ({ ...prev, ...response.data }));
    } catch (error) {
      // console.error(error);
      setIdentifyError(error instanceof Error ? error.message : '名片辨識失敗');
    } finally {
      setIsIdentifying(false);
    }
  }, []);

  const changeVInfoValue=(key:string,value:string)=>{
    setVcardInfo(prev=>({...prev,[key]:value}))
  }
  const clearVInfo = React.useCallback(()=>{
    setVcardInfo({
      address: '', addressEn: '', company: '', companyEn: '', companyUrl: '',
      dept: '', email: '', mobile: '', name: '', nameEn: '', phone: '', title: '',
    });
  },[]);

  const changeLEDState = React.useCallback((state:number)=>{
    const res = fetch('/api/mcu/pattern', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ pattern: state }),
    });
  },[])


  const detected = Boolean(result?.detected);

  const renderCardField = ({ label, field, full = false }: {
    label: string;
    field: keyof VcardInfo;
    full?: boolean;
  }) => (
    <Frame $full={full}>
      <FieldLabel>{label}</FieldLabel>
      <InputWrap>
        <TextInput
          className="w-full"
          maxLength={field === 'address' || field === 'addressEn' ? 200 : 100}
          value={vcardInfo[field] ?? ''}
          onInput={(value) => changeVInfoValue(field, value)}
        />
      </InputWrap>
    </Frame>
  );

  return (
    <Container>
      <PageContent>
        <Header>
          <Brand>
            <BrandMark>MT</BrandMark>
            <div>
              <PageTitle>AI 名片智慧辨識</PageTitle>
              <PageDescription>UNO Q · Edge AI Detection + Cloud Recognition</PageDescription>
            </div>
          </Brand>
        </Header>

        <Layout>
          <Panel>
            <PanelHeader>
              <div>
                <PanelTitle>即時相機預覽</PanelTitle>
                <PanelSubtitle>將名片放入鏡頭畫面，系統會自動偵測邊界</PanelSubtitle>
              </div>
              <Status $detected={detected}>
                {detected ? '已偵測到名片' : '等待偵測'}
              </Status>
            </PanelHeader>

            <ImageContainer>
              <CameraFrame>
                <CameraImage ref={imgRef} src="/stream" alt="Camera Stream" />
                {detected && result?.image?.width > 0 && result?.image?.height > 0 && (
                  <CameraOverlay
                    viewBox={`0 0 ${result.image.width} ${result.image.height}`}
                    preserveAspectRatio="none"
                  >
                    <polygon
                      points={result.corners.map(([x, y]: number[]) => `${x},${y}`).join(' ')}
                      fill="rgba(34, 197, 94, .07)"
                      stroke="#4ade80"
                      strokeWidth="3"
                      vectorEffect="non-scaling-stroke"
                    />
                    {result.corners.map(([x, y]: number[], i: number) => (
                      <circle key={i} cx={x} cy={y} r="6" fill="#4ade80" stroke="white" strokeWidth="2" vectorEffect="non-scaling-stroke" />
                    ))}
                  </CameraOverlay>
                )}
              </CameraFrame>

              <Performance>
                {([
                  ['Preprocess', result?.preprocess_ms],
                  ['Inference', result?.inference_ms],
                  ['Postprocess', result?.postprocess_ms],
                  ['Total', result?.total_ms],
                ] as const).map(([label, value]) => (
                  <PerformanceItem key={label}>
                    <MetricLabel>{label}</MetricLabel>
                    <MetricValue>{typeof value === 'number' ? value.toFixed(1) : '—'} <span>ms</span></MetricValue>
                  </PerformanceItem>
                ))}
              </Performance>
            </ImageContainer>

            <ActionBar>
              {/* <ActionWrapper>
                <ActButton text="擷取照片" onClick={handleCapture} />
              </ActionWrapper> */}
              {/* <ActionWrapper $disabled={isIdentifying}>
                <ActButton text='測試LED' onClick={()=>changeLEDState(2)}/>
              </ActionWrapper> */}
              <ActionWrapper $disabled={isIdentifying}>
                <ActButton
                  text={isIdentifying ? '辨識中…' : 'AI 辨識名片'}
                  onClick={identifyCard}
                  isDisable={!detected}
                />
              </ActionWrapper>
              <ActionWrapper $disabled={isIdentifying}>
                <ActButton
                  text='清除名片資訊'
                  onClick={clearVInfo}
                />
              </ActionWrapper>
            </ActionBar>
            {identifyError && <ErrorMessage>{identifyError}</ErrorMessage>}
          </Panel>
          <InfoContainer>
            <PanelHeader style={{justifyContent:'flex-start'}}>
              <PanelTitle>活動名稱</PanelTitle>
              <TextInput style={{width:'100%'}} maxLength={50} value={eventName} onInput={(text)=>{setEventName(text);refEventName.current=text;}} />
            </PanelHeader>
            <PanelHeader>
              <div>
                <PanelTitle>名片資訊</PanelTitle>
                <PanelSubtitle>AI 自動填入後，可手動校正資料</PanelSubtitle>
              </div>
              <Status $detected={Boolean(vcardInfo.nameEn || vcardInfo.name || vcardInfo.company)}>
                {vcardInfo.nameEn || vcardInfo.name || vcardInfo.company ? '資訊已填入' : '尚無資訊'}
              </Status>
            </PanelHeader>

            <FormBody>
              <FormSection>
                <SectionTitle>聯絡人資訊</SectionTitle>
                <FieldGrid>
                  {renderCardField({ label: "中文姓名", field: "name" })}
                  {renderCardField({ label: "英文姓名", field: "nameEn" })}
                  {renderCardField({ label: "職稱", field: "title" })}
                  {renderCardField({ label: "部門", field: "dept" })}
                  {renderCardField({ label: "手機", field: "mobile" })}
                  {renderCardField({ label: "電話", field: "phone" })}
                  {renderCardField({ label: "電子郵件", field: "email", full: true })}
                </FieldGrid>
              </FormSection>

              <FormSection>
                <SectionTitle>公司資訊</SectionTitle>
                <FieldGrid>
                  {renderCardField({ label: "公司名稱", field: "company", full: true })}
                  {renderCardField({ label: "英文公司名稱", field: "companyEn", full: true })}
                  {renderCardField({ label: "中文地址", field: "address", full: true })}
                  {renderCardField({ label: "英文地址", field: "addressEn", full: true })}
                  {renderCardField({ label: "公司網站", field: "companyUrl", full: true })}
                </FieldGrid>
                <FormHint>辨識結果可能存在誤差，建議確認姓名、電話及電子郵件後再使用。</FormHint>
              </FormSection>
            </FormBody>
          </InfoContainer>
        </Layout>
      </PageContent>
    </Container>
  );
}

export default App;
