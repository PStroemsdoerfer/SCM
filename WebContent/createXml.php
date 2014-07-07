<?php $xml = new SimpleXMLElement('<input/>');
				
				$qualitycontrol = $xml->addChild('qualitycontrol');
				$qualitycontrol->addAttribute('type', 'no');
				$qualitycontrol->addAttribute('losequantity', '0');
				$qualitycontrol->addAttribute('delay', '0');
				
				$sellwish = $xml->addChild('sellwish');
				
				for ($i = 1; $i <= 3; ++$i) 
				{
					$count = "sell".$i;
					if (array_key_exists($count, $_POST))
					{
						$item  = $sellwish->addChild('item');
						$item->addAttribute('article', $i);
						$item->addAttribute('quantity', $_POST[$count]);
					}	
				}
				
				$selldirect = $xml->addChild('selldirect');
				
				for ($i = 1; $i <= 3; ++$i) 
				{
					$count = "directm".$i;
					if (array_key_exists($count, $_POST))
					{
						$item  = $selldirect->addChild('item');
						$item->addAttribute('article', $i);
						$item->addAttribute('quantity', $_POST[$count]);
					
						$count = "directp".$i;
						$item->addAttribute('price', $_POST[$count]);
					
						$count = "directk".$i;
						$item->addAttribute('penalty', $_POST[$count]);
					}
				}
				
				$orderlist = $xml->addChild('orderlist');
				
				for ($i = 1; $i <= 55; ++$i) 
				{
					$count = "b".$i;
					if (array_key_exists($count, $_POST))
					{
						$order  = $orderlist->addChild('order ');
						$order ->addAttribute('article', $i);
						$order ->addAttribute('quantity', $_POST[$count]);
						$count = "bm".$i;
						$order ->addAttribute('modus', $_POST[$count]);
					}	
				}
				
				$productionlist = $xml->addChild('productionlist');
				
				for ($i = 1; $i <= 55; ++$i) 
				{
					$count = "p".$i;
					if (array_key_exists($count, $_POST))
					{
						$product = $productionlist->addChild('production');
						$product->addAttribute('article', $i);
						$product->addAttribute('quantity', $_POST[$count]);
					}
				}
			
				$workingtimelist = $xml->addChild('workingtimelist');
				
				for ($i = 1; $i <= 15; ++$i) 
				{
					$count = "ks".$i;
					if (array_key_exists($count, $_POST))
					{	
					$workingtime  = $workingtimelist->addChild('workingtime ');
					$workingtime ->addAttribute('station', $i);
					$count2 = "ku".$i;
					$workingtime ->addAttribute('shift', $_POST[$count]);
					$workingtime ->addAttribute('overtime', $_POST[$count2]);
					}	
				}
				
				Header('Content-type: text/xml');
				print($xml->asXML());
?>